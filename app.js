var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");

require('dotenv').config();


var cron = require('node-cron');

const logger2 = require('./config/logger')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


mongoose.connect(process.env.mongodb_database_url, {useNewUrlParser: true, useUnifiedTopology:true}).then(() => {
  console.log("Connected to mongodb")
}).catch((e)=>{
  logger2.error("error connecting to mongo: "+e)
});
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'htm'],
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  logger2.error("HTTP ERROR", res.locals)
  res.status(500).send("<h1>Opps, Something went wrong<h1/>");
});




module.exports = app;
