import { Cart } from "@/enitiy/cart";
import logger from "@/logger";
import database from "@/sequelize";
import axios from "axios";
import { MD5 } from "crypto-js";
import qrcode from 'qrcode'
import { Op } from "sequelize";
export interface PayOptions {
    pid: number,
    type: "alipay" | "wxpay" | "qqpay",
    notify_url: string,
    out_trade_no: string,
    name: string,
    money: string,
    clientip: string,
    device: string,
    param?: string
};

interface PayOptionsWithSign extends PayOptions {
    sign: string;
    sign_type: string;
}
export interface CreatePayRes {
    code: number,
    out_trade_no: string,
    trade_no: string,
    price: string,
    qrimg: string
}
export function toParams(opt: PayOptionsWithSign | { [key: string]: any }) {
    let keys = Object.keys(opt);
    let params = ``;
    for (let now of keys) {
        params += `${now}=${opt[now]}&`;
    }
    params = params.slice(0, -1);
    return params;
}

export class Pay {
    /**
* 根据传入的对象生成一个MD5签名字符串。
* 对象的键会被排序，并按照key=value&的格式拼接，最后加上环境变量ORDER_PASS的值，
* 然后计算MD5值并转换为小写返回。
*
* @param opt - 包含签名的键值对对象
* @returns 返回生成的MD5签名字符串
*/
    static getMdCode(opt: { [key: string]: any }) {
        let keys = Object.keys(opt);
        keys.sort((a, b) => {
            return ((a < b) ? -1 : 1);
        });
        let sign = ``;
        for (let now of keys) {
            if(now == `sign` || now == `sign_type`)
            {
                continue;
            }
            sign += `${now}=${opt[now]}&`;
        }
        sign = sign.slice(0, -1);
        sign = sign + process.env.ORDER_PASS;
        return MD5(sign).toString().toLowerCase();
    }
    static async createPay(opt: PayOptions, app: string) {
        return new Promise<CreatePayRes>(async (resolve, reject) => {
            if (opt.param) {
                let flag = JSON.parse(opt.param);
                flag[`app`] = app
                opt.param = JSON.stringify(flag);
            }
            else {
                opt.param = JSON.stringify({ app })
            }
            logger.info(`创建订单：${app}-${opt.out_trade_no}`);
            let optWithSign: PayOptionsWithSign = {
                ...opt,
                sign: this.getMdCode(opt),
                sign_type: `MD5`
            }
            try {
                let respon = await axios.post(`https://v2v2.v2v2.cn/mapi.php?` + toParams(optWithSign));
                if (respon.data.code !== 1) {
                    reject(`创建订单失败` + respon.data.msg);
                }
                else {
                    try {
                        Cart.create({
                            app: app,
                            payType: opt.type,
                            outTradeNo: opt.out_trade_no,
                            productName: opt.name,
                            price: opt.money,
                            realPayed: 0,
                            clientIp: opt.clientip,
                            status: `pending`
                        });
                        let buffer = await qrcode.toBuffer(respon.data.qrcode);
                        resolve({
                            code: 200,
                            trade_no: respon.data.trade_no,
                            price: respon.data.price,
                            qrimg: buffer.toString(`base64`),
                            out_trade_no: opt.out_trade_no
                        })
                    } catch (err) {
                        console.error(err);
                        reject(`发生系统错误`);
                    }
                }
            }
            catch (e) { console.error(e); reject(`发生系统错误`); }

            return axios.post(`https://v2v2.v2v2.cn/mapi.php?` + toParams(optWithSign));

        })
    }
    static async PayFinishHandel(trade_no: string, trade_status: string, param: string) {
        let params = JSON.parse(param);
        logger.info(`支付回调：${trade_no}-${trade_status}`);
        database.transaction(async () => {
            Cart.findOne({ where: { outTradeNo: trade_no, app: params[`app`] } }).then(async (cart) => {
                if (cart) {
                    if (trade_status == `TRADE_SUCCESS`) {
                        cart.status = `success`;
                        cart.save();
                    }
                    else {
                        cart.status = `failed`;
                    }
                }
                else {
                    throw Error(`订单不存在`);
                }
            })
        }).then(() => {
            logger.info(`${trade_no} 支付回调成功`);
        }).catch((err) => {
            logger.error(err);
            logger.error(`${trade_no} 支付回调失败`);
        })
    }

    static async PayTimeoutHandel() {
        Cart.update({
            status: `timeout`
        }, {
            where: {
                createdAt: {
                    [Op.lte]: new Date(new Date().getTime() - 1000 * 60 * 5)
                }
            }
        })
    }
}