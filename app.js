var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    routes = require('./server/routes'),
    app = express();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride());
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.use('/', routes);

app.use(function (req, res, next) {
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

if (app.get('env') === 'development') {
  app.use(function (error, req, res, next) {
    res.status(error.status || 500);
    res.render('error', {
        message: error.message,
        error: error,
        title: 'error'
    });
  });
}

app.use(function (error, req, res, next) {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: {},
    title: 'error'
  });
});

module.exports = app;