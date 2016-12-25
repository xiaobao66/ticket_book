var express = require('express'),
    userInfoManager = express.Router();

var db;

//获取用户信息
userInfoManager.get('/rest/user_info_manager', function (req, res) {
    var totalUserInfoSql = "SELECT\n" +
        "	COUNT(*) total\n" +
        "FROM\n" +
        "	user_info\n" +
        "WHERE\n" +
        "	1 = 1";

    var userInfoSql = "SELECT\n" +
        "	`id`,\n" +
        "	username,\n" +
        "	`password`,\n" +
        "	`name`,\n" +
        "	sex,\n" +
        "	telephone,\n" +
        "	flag\n" +
        "FROM\n" +
        "	user_info\n" +
        "WHERE\n" +
        "	1 = 1";

    if (req.query.username) {
        totalUserInfoSql += ' AND username LIKE ' + "'%" + req.query.username + "%'";
        userInfoSql += ' AND username LIKE ' + "'%" + req.query.username + "%'";
    } else if (req.query.name) {
        totalUserInfoSql += ' AND `name` LIKE ' + "'%" + req.query.name + "%'";
        userInfoSql += ' AND `name` LIKE ' + "'%" + req.query.name + "%'";
    }

    userInfoSql += ' ORDER BY `id` ASC';
    userInfoSql += ' LIMIT ' + (req.query.page - 1) * req.query.pageSize + ', ' + req.query.pageSize;

    var data = {
        page: req.query.page,
        pageSize: req.query.pageSize
    };

    db.query(totalUserInfoSql).done(function (result, fields) {
        data.total = result[0].total;
        db.query(userInfoSql).done(function (result, fields) {
            data.results = [];
            for (var i = 0; i < result.length; i++) {
                data.results[i] = {
                    id: result[i].id,
                    name: result[i].name,
                    flag: result[i].flag,
                    username: result[i].username,
                    password: result[i].password,
                    sex: result[i].sex,
                    telephone: result[i].telephone
                }
            }
            res.json(data);
        })
    })
});

//新增用户信息
userInfoManager.post('/rest/user_info_manager_add', function (req, res) {
    var insertUserInfoSql = "INSERT INTO user_info (\n" +
        "	username,\n" +
        "	`password`,\n" +
        "	`name`,\n" +
        "	sex,\n" +
        "	telephone,\n" +
        "	flag\n" +
        ")\n" +
        "VALUES\n" +
        "	(?,?,?,?,?,?)";

    db.query(insertUserInfoSql, [req.body.username, '123456', req.body.name, req.body.sex, req.body.telephone, 0]).then(function (result, fields) {
        res.json({
            flag: 1
        });
    }, function (err) {
        res.json({
            flag: -1,
            err: err
        })
    });
});

//修改用户信息(修改密码)
userInfoManager.post('/rest/user_info_manager_edit', function (req, res) {
    var updateUserInfoSql = "UPDATE user_info\n" +
        "SET `password` = ?\n" +
        "WHERE\n" +
        "	username = ?";

    db.query(updateUserInfoSql, [req.body.password, req.body.username]).then(function (result, fields) {
        res.json({
            flag: 1,
            userInfo: req.body
        });
    }, function (err) {
        res.json({
            flag: -1,
            err: err
        })
    });
});

module.exports = {
    config: function (dbConfig) {
        db = dbConfig;
    },
    userInfoManager: userInfoManager
};