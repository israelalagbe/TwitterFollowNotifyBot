const express = require('express');

const Twit = require('twit')
const axios = require('axios');
const md5 = require('md5');

const logger = require('../config/logger')



logger.log("Hello log")
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

//   console.time('debug')
//   const count = 1000000
//   const arrayItems = new Array(count).fill("jdjdjdjdjdjdj").join('')
//   const arrayItems2 = new Array(count).fill("jdjdjdjdjdjdj").join('')
  
//   if(md5(arrayItems) === md5(arrayItems2)){
//     console.log("yes way", count);
//   }
//   console.timeEnd('debug')

//   const b = arrayItems.length * 2;
// const kb = (b / 1024).toFixed(2);

// console.log(`${kb}KB`);
  
 
  const T = new Twit({
    consumer_key:         process.env.consumer_key,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  })
//   const payload = {
//     event: {
//         type: "message_create",
//         message_create: {
//             target: {
//                 recipient_id: "3062433100"
//             },
//             message_data: {
//                 text: "Hi Israel\n @israelalagbe just unfollowed you!"
//             }
//         }
//     }
//   };
//   T.post('direct_messages/events/new',payload, function(err, data, response) {
//     console.log("logging data :",data);
//     console.log("logging error :", err);
// });
log4js
  res.render('index', { title: 'Express' });

});

router.get('/twitter', function(req, res, next) {

  
  
  res.json({
    'a': 'fd'
  });
});
module.exports = router;
