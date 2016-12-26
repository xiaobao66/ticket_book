var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//路由管理
var login = require('./router/login');
var userInfo = require('./router/user_info');
var teacherWorkloadInfo = require('./router/teacher_workload_info');
var teacherClassInfo = require('./router/teacher_class_info');
var userInfoManager = require('./router/user_info_manager');
var ticketCityManager = require('./router/ticket_city_manager');
var ticketBookManager = require('./router/ticket_book_manager');
var classInfoManager = require('./router/class_info_manager');
var teacherTeachClassManager = require('./router/teacher_teach_class_manager');

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

//教师工作量路由处理
teacherWorkloadInfo.config(db);
app.use('/', teacherWorkloadInfo.teacherWorloadInfo);

//教师上课信息路由处理
teacherClassInfo.config(db);
app.use('/', teacherClassInfo.teacherClassInfo);

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

//课程信息路由处理
classInfoManager.config(db);
app.use('/', classInfoManager.classInfoManager);

//教师上课信息路由处理
teacherTeachClassManager.config(db);
app.use('/', teacherTeachClassManager.teacherTeachClassManager);

//启动express服务器
app.listen('3001', function () {
    console.log('server started');
});