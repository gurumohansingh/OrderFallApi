var express = require('express');
var router = express.Router();
var orecleDb = require('oracledb')
var dbConfig = require('../services/dbConfig')
var orecleDataService = require('../services/dataBaseService')
var Promise = require('promise');
"use strict";
class orderFallController {
  getAllOrderFall(req, res, next) {
    console.log('log')
    try {
      orecleDataService.ReadData('select * from TRANSFORM_RULES1')
        .then(result => {
          res.status(400);
          res.set("Connection", "close");
          res.json(result);
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
    try {
      var jSonData = JSON.parse(req.body.postData);
      var query = "INSERT INTO ORDER_FALLOUT_TASK(NAME, CREATED_ON, DESCRIPTION) VALUES (:NAME, SYSDATE, :DESCRIPTION) RETURN OF_TASK_ID INTO :id";
      orecleDataService.AddDataOrderFalloutTask(query,
        {
          NAME: jSonData.orderFallMain.name, DESCRIPTION: jSonData.orderFallMain.description,
          id: { type: orecleDb.NUMBER, dir: orecleDb.BIND_OUT }
        })
        .then(data => {
          if (data.outBinds && data.outBinds.id) {
            var newTaskId = data.outBinds.id[0];
            var extractionTaskData = jSonData.extractionTask;
            for (var i = 0; i < extractionTaskData.length; i++) {

              extractionTaskData[i].of_task_id = newTaskId;
              var keys = [], keysVal = [];
              for (var data in extractionTaskData[i]) keys.push(data);
              for (var data in extractionTaskData[i]) keysVal.push(':' + data);
              var colums = keys.toString();
              query = "INSERT INTO EXTRACTION_RULES (" + colums + ") values(" + keysVal.toString() + ")";
              orecleDataService.AddDataOrderFalloutTask(query, extractionTaskData[i]) .then(data => {
                console.log('EXTRACTION RULES Data Inserted successfully');
              })
              .catch(err => {               
                res.json({Message:'Error'+err.message})
              })
            }
            var transformTaskData = jSonData.transformTask
            for (var i = 0; i < transformTaskData.length; i++) {

              transformTaskData[i].of_task_id = newTaskId;
              var keys = [], keysVal = [];
              for (var data in transformTaskData[i]) keys.push(data);
              for (var data in transformTaskData[i]) keysVal.push(':' + data);
              query = "INSERT INTO transform_rules (" + keys.toString() + ") values(" + keysVal.toString() + ")";
              orecleDataService.AddDataOrderFalloutTask(query, transformTaskData[i]) .then(data => {
                console.log('Transform Rules Data Inserted successfully')
              })
              .catch(err => {               
                res.json({Message:'Error'+err.message})
              })
            }
            var requestMessageData = jSonData.requestMessage
            for (var i = 0; i < requestMessageData.length; i++) {

              requestMessageData[i].of_task_id = newTaskId;
              var keys = [], keysVal = [];
              for (var data in requestMessageData[i]) keys.push(data);
              for (var data in requestMessageData[i]) keysVal.push(':' + data);
              query = "INSERT INTO request_payload (" + keys.toString() + ") values(" + keysVal.toString() + ")";
              orecleDataService.AddDataOrderFalloutTask(query, requestMessageData[i]) .then(data => {
                console.log('Request Message Data Inserted successfully')
                res.json({Message:'Success'})
              })
              .catch(err => {
                res.json({Message:'Error'+err.message})
              })
            }
          }
         
        })
        .catch(err => {
          res.json({Message:'Error'+err.message})
        })

    } catch (error) {
      res.json({Message:'Error'+error})
    }
  }

  EditOrderFall(req, res, next) {
    console.log(req);
    res.json({ name: 'Edit' })
  }
}
module.exports = new orderFallController;
