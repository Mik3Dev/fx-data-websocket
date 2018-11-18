const express = require('express');
const socketIO = require('socket.io');
const logger = require('morgan');
const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose');
const _ = require('lodash');

const PORT = process.env.PORT || 4000;

const Candle = require('./models/candle');
const instruments = require('./commons/insturments');
const timeframes = require('./commons/timeframes');
const config = require('./config');

mongoose.connect(config.FX_DATABASE_URL, {
    'useNewUrlParser': true
}).then(
    () => console.log('Database connection is ready!'),
    err => console.log(`Ups, something went wrong. Can not connect to database. \n${err}`)
);

const server = express()
    .use(logger('dev'))
    .use(express.json())
    .use(cors({
        "origin": config.ORIGIN
    }))
    .use(express.static(path.join(__dirname, 'public')))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

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
    Promise.all(promises).then(r => io.emit('fxData', r));
}, config.TIMER);