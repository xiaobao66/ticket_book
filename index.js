var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//路由管理
var login = require('./router/login');
var userInfo = require('./router/user_info');
var userInfoManager = require('./router/user_info_manager');
var ticketCityManager = require('./router/ticket_city_manager');
var ticketBookManager = require('./router/ticket_book_manager');
var userBookTicket = require('./router/user_book_ticket');
var userTicketOrder = require('./router/user_ticket_order');

var db = require('./lib/mysql').config(require('./db.config.js'));

var app = express();

//加载模板引擎ejs
app.engine('html', require('ejs').renderFile);
app.set('views', './');
app.set('view engine', 'html');

//绑定路由处理
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    var path = req.path;

    if (/^\/rest\/.+$/g.test(path)) {
        next();
        return;
    }

    if (path == "/") {
        path = "ismartjs/index.html";
    } else {
        path = "ismartjs/" + path;
    }

    if (path.indexOf(".html") != -1) {
        res.render(path);
    } else {
        res.sendFile(path, {root: __dirname});
    }
});

//用户登录处理
login.config(db);
app.use('/', login.login);

//用户基本信息路由处理
userInfo.config(db);
app.use('/', userInfo.userInfo);

//用户车票预订路由处理
userBookTicket.config(db);
app.use('/', userBookTicket.userBookTicket);

//用户订单信息路由处理
userTicketOrder.config(db);
app.use('/', userTicketOrder.userTicketOrder);

//超级管理员
//用户信息路由处理
userInfoManager.config(db);
app.use('/', userInfoManager.userInfoManager);

//车票城市信息路由处理
ticketCityManager.config(db);
app.use('/', ticketCityManager.ticketCityManager);

//车票信息路由处理
ticketBookManager.config(db);
app.use('/', ticketBookManager.ticketBookManager);

//启动express服务器
app.listen('3001', function () {
    console.log('server started');
});