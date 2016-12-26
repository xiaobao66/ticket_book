var express = require('express'),
    login = express.Router();

var db;
var loginRecord = {};

//用户登录状态查询
login.get('/rest/login/check', function (req, res) {
    var loginId = req.cookies.loginId;
    if (loginId) {
        if (loginId in loginRecord) {
            res.json({
                loginFlag: true,
                username: loginRecord[loginId].username,
                flag: loginRecord[loginId].flag,
                userId: loginRecord[loginId].userId
            });
        } else {
            res.json({
                loginFlag: false
            });
        }
    } else {
        res.json({
            loginFlag: false
        });
    }
});

//用户登录处理
login.post('/rest/login', function (req, res) {
    var username = req.body.account,
        password = req.body.password;

    var userSql = 'select * from user_info where username = ?';

    //数据库中查询用户信息
    db.query(userSql, [username]).done(function (result, fields) {
        if (result.length === 0) {
            res.json({
                loginFlag: -1
            });
        } else if (result[0].password !== password) {
            res.json({
                loginFlag: -2
            });
        } else {
            var loginId = Math.random() + '' + result[0].id;
            loginRecord[loginId] = {
                username: username,
                flag: result[0].flag,
                userId: result[0]['id'] ? result[0]['id'] : ''
            };
            // console.log(loginRecord);
            res.cookie('loginId', loginId, {
                expires: new Date(Date.now() + 86400000)
            });
            res.json({
                loginFlag: 1,
                username: username,
                flag: result[0].flag,
                userId: result[0]['id'] ? result[0]['id'] : ''
            });
        }
    });
});

//用户登出处理
login.get('/rest/logout', function (req, res) {
    res.clearCookie('loginId');
    delete loginRecord[req.cookies.loginId];
    res.end('log out');
});


//用户注册
login.post('/rest/register', function (req, res) {
    var checkUsernameValidSql = "SELECT\n" +
        "	COUNT(*) total\n" +
        "FROM\n" +
        "	user_info\n" +
        "WHERE\n" +
        "	username = ?";

    var insertUserSql = "INSERT INTO user_info (\n" +
        "	username,\n" +
        "	`password`,\n" +
        "	`name`,\n" +
        "	sex,\n" +
        "	telephone,\n" +
        "	flag\n" +
        ")\n" +
        "VALUES\n" +
        "	(?,?,?,?,?,?)";


    db.query(checkUsernameValidSql, [req.body.username]).done(function (result, fields) {
        if (result[0].total > 0) {
            res.json({
                flag: -1
            });
        } else {
            db.query(insertUserSql, [req.body.username, req.body.password, req.body.name, req.body.sex, req.body.telephone, 0]).done(function (result, field) {
                res.json({
                    flag: 1
                });
            }, function (err) {
                res.json({
                    flag: -2,
                    err: err
                })
            });
        }
    });

});

module.exports = {
    config: function (dbConfig) {
        db = dbConfig;
    },
    login: login
};