# OrderFallApi
this is CRUD API with Oracle using Express, co, and promise.

//get All Orderfall out task for drop down
router.get('/orderfallout/task',serviceController.getAllOrderFall);

//get All Orderfall out forms data for task Id
router.get('/orderfallout/task/:id',serviceController.getOrderFall);

//post  for new form
router.post('/orderfallout/task',serviceController.AddNewOrderFall);

//get services from Mapping
router.get('/orderfallout/services/:name',serviceController.getServices);
//delete All data
router.delete('/orderfallout/task/:id',serviceController.DeleteOrderFall);


How to Start locally.
 
1. download OrderfallApi.
2. open CMD  and set this current directory
3. run "npm install"
4. run "npm start" 
5. open any browser or rest test tool and consume with localhost:3000
