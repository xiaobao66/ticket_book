var express = require('express'),
    ticketBookManager = express.Router();

var db;

//获取出发地信息
ticketBookManager.get('/rest/query_departure', function (req, res) {
    var departureSql = "SELECT\n" +
        "	city_id,\n" +
        "	cityName\n" +
        "FROM\n" +
        "	ticket_city\n" +
        "ORDER BY\n" +
        "	city_id ASC";

    db.query(departureSql).done(function (result, fields) {
        var data = [];
        for (var i = 0; i < result.length; i++) {
            data[i] = {
                id: result[i].city_id,
                name: result[i].cityName
            }
        }
        res.json(data);
    });
});

//获取目的地信息
ticketBookManager.get('/rest/query_destination', function (req, res) {
    var destinationSql = "SELECT\n" +
        "	city_id,\n" +
        "	cityName\n" +
        "FROM\n" +
        "	ticket_city\n" +
        "ORDER BY\n" +
        "	city_id ASC";

    db.query(destinationSql).done(function (result, fields) {
        var data = [];
        for (var i = 0; i < result.length; i++) {
            data[i] = {
                id: result[i].city_id,
                name: result[i].cityName
            }
        }
        res.json(data);
    });
});

//获取车票信息
ticketBookManager.get('/rest/ticket_book_manager', function (req, res) {
    //获取车票总数
    var totalTicketSettingSql = "SELECT\n" +
        "	COUNT(*) total\n" +
        "FROM\n" +
        "	ticket_setting\n" +
        "WHERE\n" +
        "	1 = 1";

    //获取车票详细信息
    var ticketSettingSql = "SELECT\n" +
        "	ticket_id,\n" +
        "	departure departureId,\n" +
        "	destination destinationId,\n" +
        "	t1.cityName departure,\n" +
        "	t2.cityName destination,\n" +
        "	DATE_FORMAT(`time`, '%Y-%m-%d %H:%I') `time`,\n" +
        "	price,\n" +
        "	amount\n" +
        "FROM\n" +
        "	ticket_city t1,\n" +
        "	ticket_city t2,\n" +
        "	ticket_setting\n" +
        "WHERE\n" +
        "	t1.city_id = departure\n" +
        "AND t2.city_id = destination";

    if (req.query.departure) {
        totalTicketSettingSql += ' AND ticket_setting.departure = ' + req.query.departure;
        ticketSettingSql += ' AND ticket_setting.departure = ' + req.query.departure;
    }

    if (req.query.destination) {
        totalTicketSettingSql += ' AND ticket_setting.destination = ' + req.query.destination;
        ticketSettingSql += ' AND ticket_setting.destination = ' + req.query.destination;
    }

    if (req.query.time) {
        totalTicketSettingSql += ' AND ticket_setting.`time` <= "' + req.query.time + '"';
        ticketSettingSql += ' AND ticket_setting.`time` <= "' + req.query.time + '"';
    }

    totalTicketSettingSql += ' ORDER BY ticket_id ASC';
    ticketSettingSql += ' ORDER BY ticket_id ASC';
    ticketSettingSql += ' LIMIT ' + (req.query.page - 1) * req.query.pageSize + ', ' + req.query.pageSize;

    var data = {
        page: req.query.page,
        pageSize: req.query.pageSize
    };

    db.query(totalTicketSettingSql).done(function (result, fields) {
        data.total = result[0].total;
        db.query(ticketSettingSql).done(function (result, fields) {
            data.results = [];
            for (var i = 0; i < result.length; i++) {
                data.results[i] = {
                    ticket_id: result[i]['ticket_id'],
                    departureId: result[i].departureId,
                    destinationId: result[i].destinationId,
                    departure: result[i].departure,
                    destination: result[i]['destination'],
                    time: result[i]['time'],
                    price: result[i].price,
                    amount: result[i].amount
                }
            }
            res.json(data);
        })
    })
});

module.exports = {
    config: function (dbConfig) {
        db = dbConfig;
    },
    ticketBookManager: ticketBookManager
};