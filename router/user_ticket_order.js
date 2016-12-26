var express = require('express'),
    userTicketOrder = express.Router();

var db;

//获取用户订单信息
userTicketOrder.get('/rest/user_ticket_order', function (req, res) {
    var userTicketOrderSql = "SELECT\n" +
        "	*\n" +
        "FROM\n" +
        "	user_ticket\n" +
        "WHERE\n" +
        "	user_id = ?";

    //获取车票总数
    var totalTicketSettingSql = "SELECT\n" +
        "	COUNT(*) total\n" +
        "FROM\n" +
        "	ticket_setting\n" +
        "WHERE\n" +
        "	ticket_id IN ?";

    //获取车票详细信息
    var ticketSettingSql = "SELECT\n" +
        "	ticket_id,\n" +
        "	departure departureId,\n" +
        "	destination destinationId,\n" +
        "	t1.cityName departure,\n" +
        "	t2.cityName destination,\n" +
        "	DATE_FORMAT(\n" +
        "		departure_time,\n" +
        "		'%Y-%m-%d %H:%i'\n" +
        "	) departure_time,\n" +
        "	DATE_FORMAT(\n" +
        "		arrive_time,\n" +
        "		'%Y-%m-%d %H:%i'\n" +
        "	) arrive_time,\n" +
        "	price,\n" +
        "	amount\n" +
        "FROM\n" +
        "	ticket_city t1,\n" +
        "	ticket_city t2,\n" +
        "	ticket_setting\n" +
        "WHERE\n" +
        "	t1.city_id = departure\n" +
        "AND t2.city_id = destination\n" +
        "AND ticket_id IN ?";

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

    totalTicketSettingSql += ' ORDER BY departure_time DESC';
    ticketSettingSql += ' ORDER BY departure_time DESC';
    ticketSettingSql += ' LIMIT ' + (req.query.page - 1) * req.query.pageSize + ', ' + req.query.pageSize;

    var data = {
        page: req.query.page,
        pageSize: req.query.pageSize
    };

    db.query(userTicketOrderSql, [req.query.userId]).done(function (result, fields) {
        if (result.length === 0) {
            data.total = 0;
            data.results = [];
            res.json(data);
        } else {
            var ticketIdList = [[]];
            for (var i = 0; i < result.length; i++) {
                ticketIdList[0][i] = result[i]['ticket_id']
            }

            db.query(totalTicketSettingSql, [ticketIdList]).then(function (result, fields) {
                data.total = result[0].total;
                if (data.total === 0) {
                    data.results = [];
                    res.json(data);
                } else {
                    db.query(ticketSettingSql, [ticketIdList]).then(function (result, fields) {
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
                    });
                }
            });
        }
    });
});

module.exports = {
    config: function (dbConfig) {
        db = dbConfig;
    },
    userTicketOrder: userTicketOrder
};