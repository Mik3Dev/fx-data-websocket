const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);

const mongoose = require('mongoose');
const Candle = require('./models/candle');

const instruments = require('./commons/insturments');
const timeframes = require('./commons/timeframes');

const path = require('path');
const config = require('./config');

const _ = require('lodash');
const logger = require('morgan');


mongoose.connect(config.FX_DATABASE_URL, {
    'useNewUrlParser': true
}).then(
    () => console.log('Database connection is ready!'),
    err => console.log(`Ups, something went wrong. Can not connect to database. \n${err}`)
);

app.use(logger('dev'));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/socket', (req, res) => {
    io.on('connection', (socket) => {
        setInterval( () => {
            let promises = [];
            _.forEach(instruments, instrument => {
                _.forEach(timeframes, timeframe => {
                    promises.push(new Promise((resolve) => {
                        Candle.findOne({instrument, timeframe})
                            .sort({'time':-1})
                            .then(r => resolve(r));
                    }));
                })
            })
            Promise.all(promises).then(r => socket.emit('fxData', r));
        }, config.TIMER)
    });
})

server.listen(config.PORT, () => {
    console.log(`The server is running on port ${config.PORT}`);
})