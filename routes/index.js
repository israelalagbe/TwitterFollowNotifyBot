const express = require('express');

const Twit = require('twit')
const axios = require('axios');
const md5 = require('md5');
const logger = require('../config/logger');
const Bot = require('../helpers/Bot');





var router = express.Router();


/* GET home page. */
router.get('/', async (req, res, next) => {

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
  
 
 
  // const response = await Bot.tweet("Second Bot test")
  // logger.info("Item",response)
  // console.log(await Bot.getFollowers({user_id: 3062433100}))
  
  res.render('index', { title: 'Express' });
});

router.get('/twitter', function(req, res, next) {

  
  
  res.json({
    'a': 'fd'
  });
});
module.exports = router;
