const cluster = require("node:cluster");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const usersRouter = require('./routes/users');
const { default: rateLimit } = require('express-rate-limit');

const app = express()
if (!cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`)

    const numberCPUs = 2
    for (let i = 0; i < numberCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(
            `worker ${worker.process.pid} died with code ${code} from signal ${signal}.`,
        )
    })
} else {

    const limiter = rateLimit({
        limit: 20,
        message: async () => {
            return 'You can only make 20 requests every min.'
        },
        keyGenerator: (req) => {
            return req.body.userId; // use user ID as the key
        },
        standardHeaders: true,
        legacyHeaders: false,
    })

    app.use(logger('tiny'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(limiter)

    app.get('/', (_, res) => {
        res.send('Hello World!')
    })
    app.use('/api/v1/task', usersRouter)
}

module.exports = app;
