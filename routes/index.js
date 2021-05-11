var express = require('express');

var Twit = require('twit')
var axios = require('axios');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/twitter', function(req, res, next) {

  
  
  res.json({
    'a': 'fd'
  });
});
module.exports = router;
