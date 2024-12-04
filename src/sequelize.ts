import { Sequelize } from 'sequelize'
import clsHooked from 'cls-hooked';
import { logger } from './logger';
Sequelize.useCLS(clsHooked.createNamespace('sequelize-transaction'));
export const database = new Sequelize(process.env.mysql_database, process.env.mysql_user, process.env.mysql_password, {
    host: process.env.mysql_host,
    dialect: 'mysql',
    pool: {
        max: 1,
        min: 1,
        acquire: 30000,
        idle: 10000
    },
    logging: (msg) => {
        logger.info(msg)
    }
})

database.authenticate()
    .then(() => {
        logger.info('Connection has been established successfully.');
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', err);
    })
export default database;