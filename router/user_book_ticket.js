var express = require('express'),
    userBookTicket = express.Router();

var db;

//用户预订车票
userBookTicket.post('/rest/user_ticket_book', function (req, res) {
    var checkUserTicketSql = "SELECT\n" +
        "	COUNT(*) total\n" +
        "FROM\n" +
        "	user_ticket\n" +
        "WHERE\n" +
        "	user_id = ?\n" +
        "AND ticket_id = ?";

    var insertUserTicketSql = "INSERT INTO user_ticket (user_id, ticket_id)\n" +
        "VALUES\n" +
        "	(?, ?)";

    var updateTicketSettingSql = "UPDATE ticket_setting\n" +
        "SET amount = ?\n" +
        "WHERE\n" +
        "	ticket_id = ?";

    db.query(checkUserTicketSql, [req.body.userId, req.body.ticketId]).then(function (result, fields) {
        if (result[0].total > 0) {
            res.json({
                flag: -1
            })
        } else {
            db.query(insertUserTicketSql, [req.body.userId, req.body.ticketId]).then(function (result, fields) {
                db.query(updateTicketSettingSql, [req.body.amount, req.body.ticketId]).then(function (result, fields) {
                    res.json({
                        flag: 1
                    })
                }, function (err) {
                    res.json({
                        flag: -2,
                        err: err
                    })
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
    userBookTicket: userBookTicket
};