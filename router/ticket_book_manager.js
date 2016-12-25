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
        "	DATE_FORMAT(departure_time, '%Y-%m-%d %H:%i') departure_time,\n" +
        "	DATE_FORMAT(arrive_time, '%Y-%m-%d %H:%i') arrive_time,\n" +
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

    if (req.query['departure_time']) {
        totalTicketSettingSql += ' AND ticket_setting.departure_time >= "' + (req.query['departure_time'] + " 00:00:00") + '"';
        ticketSettingSql += ' AND ticket_setting.departure_time >= "' + (req.query['departure_time'] + " 00:00:00") + '"';
        totalTicketSettingSql += ' AND ticket_setting.departure_time <= "' + (req.query['departure_time'] + " 23:59:59") + '"';
        ticketSettingSql += ' AND ticket_setting.departure_time <= "' + (req.query['departure_time'] + " 23:59:59") + '"';
    }

    if (req.query['arrive_time']) {
        totalTicketSettingSql += ' AND ticket_setting.arrive_time >= "' + (req.query['arrive_time'] + " 00:00:00") + '"';
        ticketSettingSql += ' AND ticket_setting.arrive_time >= "' + (req.query['arrive_time'] + " 00:00:00") + '"';
        totalTicketSettingSql += ' AND ticket_setting.arrive_time <= "' + (req.query['arrive_time'] + " 23:59:59") + '"';
        ticketSettingSql += ' AND ticket_setting.arrive_time <= "' + (req.query['arrive_time'] + " 23:59:59") + '"';
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
                    departure_time: result[i]['departure_time'],
                    arrive_time: result[i]['arrive_time'],
                    price: result[i].price,
                    amount: result[i].amount
                }
            }
            res.json(data);
        })
    })
});

//新增车票信息
ticketBookManager.post('/rest/ticket_book_manager_add', function (req, res) {
    var insertTicketBookSql = "INSERT INTO ticket_setting (\n" +
        "	departure,\n" +
        "	destination,\n" +
        "	departure_time,\n" +
        "	arrive_time,\n" +
        "	price,\n" +
        "	amount\n" +
        ")\n" +
        "VALUES\n" +
        "	(?,?,?,?,?,?)";

    db.query(insertTicketBookSql, [req.body.departure, req.body.destination, req.body['departure_time'], req.body['arrive_time'], req.body.price, req.body.amount]).then(function (result, fields) {
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

//删除车票信息
ticketBookManager.post('/rest/ticket_book_manager_delete', function (req, res) {
    var deleteUserInfoSql = "DELETE\n" +
        "FROM\n" +
        "	ticket_setting\n" +
        "WHERE\n" +
        "	ticket_id IN ?";

    var deleteData = JSON.parse(req.body.deleteData),
        deleteId = [[]];

    for (var i = 0, len = deleteData.length; i < len; i++) {
        deleteId[0][i] = deleteData[i].ticket_id;
    }

    db.query(deleteUserInfoSql, [deleteId]).then(function (result, fields) {
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

module.exports = {
    config: function (dbConfig) {
        db = dbConfig;
    },
    ticketBookManager: ticketBookManager
};