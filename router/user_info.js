var express = require('express'),
    userInfo = express.Router();

var db;

//查询教师基本信息
userInfo.get('/rest/user_info', function (req, res) {
    var userInfoSql = "SELECT\n" +
        "	*\n" +
        "FROM\n" +
        "	user_info\n" +
        "WHERE\n" +
        "	`id` = ?";

    db.query(userInfoSql, [req.query.id]).done(function (result, fields) {
        if (result.length === 0) {
            res.json({});
        } else {
            res.json({
                username: result[0].username,
                sex: result[0].sex,
                name: result[0].name,
                telephone: result[0].telephone
            });
        }
    });
});

//修改账户密码
userInfo.post('/rest/password_change', function (req, res) {
    var username = req.body.username,
        oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;

    var checkAccountSql = "SELECT\n" +
        "	*\n" +
        "FROM\n" +
        "	user_info\n" +
        "WHERE\n" +
        "	username = ?\n" +
        "AND `password` = ?"

    var updateAccountSql = "UPDATE user_info\n" +
        "SET `password` = ?\n" +
        "WHERE\n" +
        "	username = ?";

    db.query(checkAccountSql, [username, oldPassword]).done(function (result, fields) {
        if (result.length > 0) {
            db.query(updateAccountSql, [newPassword, username]).done(function (result, field, err) {
                if (err) {
                    res.json({
                        flag: -2
                    });
                } else {
                    res.json({
                        flag: 1
                    });
                }
            });
        } else {
            res.json({
                flag: -1
            })
        }
    });
});

//修改用户基本信息
userInfo.post('/rest/user_info_edit', function (req, res) {
    var updateUserInfoSql = "UPDATE user_info\n" +
        "SET name = ?, sex = ?, telephone = ?\n" +
        "WHERE\n" +
        "	username = ?";

    db.query(updateUserInfoSql, [req.body.name, req.body.sex, req.body.telephone, req.body.username]).then(function (result, fields) {
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
    userInfo: userInfo
};