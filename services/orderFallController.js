var express = require('express');
var router = express.Router();
var orecleDb = require('oracledb')
var dbConfig = require('../services/dbConfig')
var oracleDataService = require('../services/dataBaseService')
var Promise = require('promise');
var co = require('co');
"use strict";
class orderFallController {
  getAllOrderFall(req, res, next) {
    try {
      oracleDataService.ReadData('select * from order_fallout_task where created_on >=(sysdate-30)', {})
        .then(result => {
          res.status(200);
          res.set("Connection", "close");
          res.json({ response: result.rows });
        })
        .catch(err => {
          res.json(new Error('Error'))
        })
    } catch (error) {
      res.status(400);
      res.set("Connection", "close");
      res.json(new Error('Error'))
    }
  }
  getServices(req, res, next) {
    try {
      var name = req.params.name;
      oracleDataService.ReadData('select name, SERVICE_NAME, URL from  endpoint_mapping where name=:name order by SERVICE_NAME', { name: name })
        .then(result => {
          res.status(200);
          res.set("Connection", "close");
          res.json({ response: result.rows });
        })
        .catch(err => {
          res.json(new Error('Error'))
        })
    } catch (error) {
      res.status(400);
      res.set("Connection", "close");
      res.json(new Error('Error'))
    }
  }

  getOrderFall(req, res, next) {
    console.log(req);
    res.json({ name: 'getOne' })
  }


  AddNewOrderFall(req, res, next) {
    co(function* () {
      try {
        var jSonData = JSON.parse(req.body.postData);
        var taskId = jSonData.editId;
        var edit = taskId ? taskId : null;
        if (jSonData.addEditFlag === "Edit" && jSonData.editId) {
          var query = "UPDATE ORDER_FALLOUT_TASK set NAME=:NAME, LAST_MODIFIED= SYSDATE, DESCRIPTION = :DESCRIPTION where OF_TASK_ID=:id";
          var data = yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              NAME: jSonData.orderFallMain.name,
              DESCRIPTION: jSonData.orderFallMain.description,
              id: jSonData.editId
            })
        } else {
          var query = "INSERT INTO ORDER_FALLOUT_TASK(NAME, CREATED_ON, DESCRIPTION) VALUES (:NAME, SYSDATE, :DESCRIPTION) RETURN OF_TASK_ID INTO :id";
          var data = yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              NAME: jSonData.orderFallMain.name, DESCRIPTION: jSonData.orderFallMain.description,
              id: { type: orecleDb.NUMBER, dir: orecleDb.BIND_OUT }
            })
          taskId = data.outBinds.id[0]
        }
        if (taskId) {
          var obj = new orderFallController();
          var extractionTaskData = jSonData.extractionTask;
          yield obj.AddExtractionTaskData(extractionTaskData, taskId, edit)
          var transformTaskData = jSonData.transformTask
          yield obj.AddTransformTaskData(transformTaskData, taskId, edit);
          var requestMessageData = jSonData.requestMessage
          yield obj.AddRequestMessageData(requestMessageData, taskId,edit);
          res.json({ Message: 'Success' })
        }
      } catch (error) {
         res.status(400);
        res.json({ Message: error })
      }
    })
  }
  AddExtractionTaskData(extractionTaskData, newTaskId, edit) {
    return new Promise((resolve, reject) => {
      co(function* () {
        var query = "";
        if (edit) {
          query = "delete from extraction_rules where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: newTaskId
            })
        }
        for (var i = 0; i < extractionTaskData.length; i++) {
          extractionTaskData[i].of_task_id = newTaskId;
          var keys = [], keysVal = [];
          for (var data in extractionTaskData[i]) keys.push(data);
          for (var data in extractionTaskData[i]) keysVal.push(':' + data);
          var colums = keys.toString();
          query = "INSERT INTO EXTRACTION_RULES (" + colums + ") values(" + keysVal.toString() + ")";
          yield oracleDataService.AddDataOrderFalloutTask(query, extractionTaskData[i]).then(data => {
            console.log('EXTRACTION RULES Data Inserted successfully');
            if (i === extractionTaskData.length - 1)
              return resolve(true);
          })
            .catch(err => {
              return reject({ Message: 'Error' + err.message });
            })
        }
      })
    })
  }
  AddTransformTaskData(transformTaskData, newTaskId, edit) {
    return new Promise((resolve, reject) => {
      co(function* () {
        var query = "";
        if (edit) {
          query = "delete from transform_rules where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: newTaskId
            })
        }
        for (var i = 0; i < transformTaskData.length; i++) {

          transformTaskData[i].of_task_id = newTaskId;
          var keys = [], keysVal = [];
          for (var data in transformTaskData[i]) keys.push(data);
          for (var data in transformTaskData[i]) keysVal.push(':' + data);
          query = "INSERT INTO transform_rules (" + keys.toString() + ") values(" + keysVal.toString() + ")";
          yield oracleDataService.AddDataOrderFalloutTask(query, transformTaskData[i]).then(data => {
            console.log('Transform Rules Data Inserted successfully')
            if (i === transformTaskData.length - 1)
              return resolve(true);
          })
            .catch(err => {
              res.json({ Message: 'Error ' + err.message })
            })
        }
      })
    })
  }
  AddRequestMessageData(requestMessageData, newTaskId, edit) {
    return new Promise((resolve, reject) => {
      co(function* () {
        var query = "";
        if (edit) {
          query = "delete from request_payload where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: newTaskId
            })
        }
        for (var i = 0; i < requestMessageData.length; i++) {
          requestMessageData[i].of_task_id = newTaskId;
          var keys = [], keysVal = [];
          for (var data in requestMessageData[i]) keys.push(data);
          for (var data in requestMessageData[i]) keysVal.push(':' + data);
          query = "INSERT INTO request_payload (" + keys.toString() + ") values(" + keysVal.toString() + ")";
          yield oracleDataService.AddDataOrderFalloutTask(query, requestMessageData[i]).then(data => {
            console.log('Request Message Data Inserted successfully')
            if (i === requestMessageData.length - 1)
              return resolve(true);

          })
            .catch(err => {
              res.json({ Message: 'Error' + err.message })
            })
        }
      })
    })
  }
  getOrderFall(req, res, next) {
    try {
      let id = req.params.id;
      let responseData = {};
      co(function* () {
        let orderFallMainData = yield oracleDataService.ReadData('select * from order_fallout_task where OF_TASK_ID=:id', { id: id })
        let format = { "REQUEST_PAYLOAD": { type: orecleDb.STRING }, "QUERY": { type: orecleDb.STRING } };
        let extractionTaskData = yield oracleDataService.ReadLobData('select * from extraction_rules where OF_TASK_ID=:id order by Extract_rule_id', { id: id }, format)
        let transformTaskData = yield oracleDataService.ReadData('select * from transform_rules where OF_TASK_ID=:id order by Transform_rule_id', { id: id })
        format = { "REQUEST_PAYLOAD": { type: orecleDb.STRING } };
        let requestMessageData = yield oracleDataService.ReadLobData('select * from request_payload where OF_TASK_ID=:id order by message_id', { id: id }, format)
        responseData.orderFallMain = orderFallMainData.rows;
        responseData.extractionTask = extractionTaskData.rows;
        responseData.transformTask = transformTaskData.rows;
        responseData.requestMessage = requestMessageData.rows;
        res.json({ response: responseData })
      })

    } catch (error) {
      res.json({ Message: 'Error' + error })
    }
  }

  DeleteOrderFall(req, res, next) {
    co(function* () {
      try {
        var id = req.params.id;
        if (id) {
          var query = "delete from extraction_rules where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: id
            })
          query = "delete from transform_rules where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: id
            })
          query = "delete from request_payload where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: id
            })
          query = "delete from  ORDER_FALLOUT_TASK where OF_TASK_ID=:id";
          yield oracleDataService.AddDataOrderFalloutTask(query,
            {
              id: id
            })
        }
        res.json({ Message: "Deleted Successfully" })
      } catch (error) {
        res.json({ Message: 'Error' + error })
      }
    })
  }
}
module.exports = new orderFallController;
