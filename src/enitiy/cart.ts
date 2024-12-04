import database from "@/sequelize";
import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class Cart extends Model<InferAttributes<Cart>, InferCreationAttributes<Cart>> {
    declare id: CreationOptional<number>;
    declare app: string;
    declare payType: "alipay" | "wxpay" | "qqpay";
    declare outTradeNo: string;
    declare productName: string;
    declare price: string;
    declare realPayed: number;
    declare clientIp: string;
    declare options: string;
    declare status: "pending" | "success" | "failed" | "timeout";
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Cart.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    app: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    payType: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    outTradeNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    realPayed: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    clientIp: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status:{
        type: DataTypes.STRING(15),
        allowNull: false,
        defaultValue: `pending`,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
},{
    sequelize: database,
    tableName: 'carts'
})