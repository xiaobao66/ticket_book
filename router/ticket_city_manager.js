var express = require('express'),
    ticketCityManager = express.Router();

var db;

//查询城市信息
ticketCityManager.get('/rest/ticket_city_manager', function (req, res) {
    var totalTicketCitySql = "SELECT\n" +
        "	count(*) total\n" +
        "FROM\n" +
        "	ticket_city\n" +
        "WHERE\n" +
        "	1 = 1";

    var ticketCitySql = "SELECT\n" +
        "	*\n" +
        "FROM\n" +
        "	ticket_city\n" +
        "WHERE\n" +
        "	1 = 1";

    if (req.query.cityName) {
        totalTicketCitySql += ' AND `cityName` LIKE ' + "'%" + req.query.cityName + "%'";
        ticketCitySql += ' AND `cityName` LIKE ' + "'%" + req.query.cityName + "%'";
    }

    ticketCitySql += ' ORDER BY city_id ASC';
    ticketCitySql += ' LIMIT ' + (req.query.page - 1) * req.query.pageSize + ', ' + req.query.pageSize;

    var data = {
        page: req.query.page,
        pageSize: req.query.pageSize
    };

    db.query(totalTicketCitySql).done(function (result, fields) {
        data.total = result[0].total;
        db.query(ticketCitySql).done(function (result, fields) {
            data.results = [];
            for (var i = 0; i < result.length; i++) {
                data.results[i] = {
                    city_id: result[i].city_id,
                    cityName: result[i].cityName
                }
            }

            res.json(data);
        })
    });
});

//新增城市信息
ticketCityManager.post('/rest/ticket_city_manager_add', function (req, res) {
    var insertTicketCitySql = "INSERT INTO ticket_city (cityName)\n" +
        "VALUES\n" +
        "	(?)";

    db.query(insertTicketCitySql, [req.body.cityName]).then(function (result, fields) {
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

//删除城市信息
ticketCityManager.post('/rest/ticket_city_manager_delete', function (req, res) {
    var deleteTicketCitySql = "DELETE\n" +
        "FROM\n" +
        "	ticket_city\n" +
        "WHERE\n" +
        "	city_id IN ?";

    var deleteData = JSON.parse(req.body.deleteData),
        deleteId = [[]];

    for (var i = 0, len = deleteData.length; i < len; i++) {
        deleteId[0][i] = deleteData[i].city_id;
    }

    db.query(deleteTicketCitySql, [deleteId]).then(function (result, fields) {
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

//修改城市信息
ticketCityManager.post('/rest/ticket_city_manager_edit', function (req, res) {
    var updateTicketCitySql = "UPDATE ticket_city\n" +
        "SET cityName = ?\n" +
        "WHERE\n" +
        "	city_id = ?";

    db.query(updateTicketCitySql, [req.body.cityName, req.body.city_id]).then(function (result, fields) {
        res.json({
            flag: 1,
            ticketCity: req.body
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
    ticketCityManager: ticketCityManager
};