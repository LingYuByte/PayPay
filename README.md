# Paypay @ LingYu Byte

Paypay 是由 [凌域字节工作室](https://lybyte.cn) 开发的，用于对接码支付平台 [萌码(及其类似平台)](https://v2v2.v2v2.cn) 的后端程序。

使用 nodejs 作为开发语言，express 作为 web 框架，mysql 作为数据库。

## 部署

1. 将代码克隆到本地。
2. 配置环境变量
    - `mysql_host`：数据库地址
    - `mysql_user`：数据库用户名
    - `mysql_password`：数据库密码
    - `mysql_database`：数据库名
    - `ORDER_PASS`：对接端密钥
    - `ORDER_PID`：对接端商户号
    - `baseURL`：服务地址，用于异步回调。
    - `PASSWORD`：与请求端一致，用于保护请求
3. 通过 `npm install` 安装依赖。
4. 通过 `npm run start` 启动服务。