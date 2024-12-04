import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
winston.addColors({
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow'
});
const transportInfo: DailyRotateFile = new DailyRotateFile({
    filename: 'PayPay-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    frequency: '24h',
    dirname: path.join(__dirname, '../logs')
});

const transportError: DailyRotateFile = new DailyRotateFile({
    level: 'error',
    filename: 'PayPay-error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    dirname: path.join(__dirname, '../logs'),
    frequency: '24h',

});
transportInfo.on('error', err => { console.error(err); });
transportError.on('err', err => { console.error(err); });

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            if(typeof info.message == 'object')
            {
                info.message = JSON.stringify(info.message);
            }
            return `${info.timestamp} [${info.level}]: ` + info.message;
        })
    ),
    transports: [
        transportInfo,
        transportError,
        new winston.transports.Console({
            level: 'warn'
        })
    ]
});

export default logger;