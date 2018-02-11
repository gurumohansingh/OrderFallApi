var express = require('express');
var router = express.Router();
var serviceController = require('../services/orderFallController');
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//get All Orderfall out task for drop down
router.get('/orderfallout/task',serviceController.getAllOrderFall);

//get All Orderfall out forms data for task Id
router.get('/orderfallout/task/:id',serviceController.getOrderFall);

//post  for new form
router.post('/orderfallout/task',serviceController.AddNewOrderFall);

//put for edit orderfall 
router.put('/orderfallout/task/:id',serviceController.EditOrderFall);

module.exports = router;
