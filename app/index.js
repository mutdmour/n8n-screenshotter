require('dotenv').config()

const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors');

// const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use(require('./src/routes'));

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
	console.log(err);
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)

  res.send(err.message);
});

const server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});

module.exports = app;