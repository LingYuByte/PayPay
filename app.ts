import dotenv from 'dotenv'
dotenv.config({
    path: __dirname + '/.env'
});
import express from 'express';
import { json, urlencoded } from 'body-parser';
import cookiePaser from 'cookie-parser'
import { body, ValidationChain, validationResult } from 'express-validator';
import { Pay } from '@/service/pay';
import logger from '@/logger';
import database from '@/sequelize';



function genValidater(names: string[]) {
    let vals: ValidationChain[] = [];
    for (let now of names) {
        vals.push(body(now, `需要字段 ${now}`).notEmpty());
    }
    return vals;
}
(async () => {
    database.sync({
        alter: true
    })
    const app = express();
    app.use(json());
    app.use(cookiePaser());
    app.use(urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', `*`);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader(`Access-Control-Allow-Credentials`, `true`);
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, uid, authorization');
        if (req.headers["accept"] == "*/*" && req.method == `OPTIONS`) {
            res.status(200).send({});
            return;
        }
        next();
    });
    app.post(`/createPay`, ...genValidater([`type`, `name`, `out_trade_no`, `price`, `app`]), async (req, res) => {
        if (validationResult(req).isEmpty() == false) {
            res.status(400).send({ code: 400, msg: `参数错误`, datas: validationResult(req).array() });
            return;
        }
        let opt = {
            pid: Number(process.env.ORDER_PID),
            type: req.body.type,
            notify_url: process.env.baseURL + `/notify`,
            out_trade_no: req.body.out_trade_no,
            name: req.body.name,
            money: req.body.price,
            clientip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || `45.132.${Math.random() * 50 + 12}.${Math.random() * 50 + 12}`,
            device: `pc`
        }
        try {
            let createRes = await Pay.createPay(opt, req.body.app);
            res.status(200).send(createRes);
        }
        catch (e) {
            res.status(200).send(e);
        }
    });
    app.get(`/notify`,async (req, res) => {
        console.log(req.query);
        const mdcode = Pay.getMdCode(req.query);
        if(mdcode !== req.query.sign)
        {
            logger.warn(`!!! 假回调 !!!`);
        }
        try
        {
            await Pay.PayFinishHandel(req.query.trade_no as string, req.query.trade_status as string, req.query.param as string);
            res.send(`success`);
        }
        catch(err)
        {
            logger.error(err);
            res.send(`fail`);
        }
    })
    app.listen(51832);
    console.log(`Server is running on port 51832`);
})()