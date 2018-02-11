var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var async = require('async');
var Promise = require('promise');
// Number of rows to return from each call to getRows()
var numRows = 1;
var dataBaseService = {
  ReadData(query) {
    return new Promise((resolve, reject) => {
      oracledb.getConnection(
        {
          user: dbConfig.user,
          password: dbConfig.password,
          connectString: dbConfig.connectString
        },
        function (err, connection) {
          if (err) {
            return reject(err)
          }
          connection.execute(query, [],
            { outFormat: oracledb.OBJECT },
            function (err, result) {
              if (err) {
                dataBaseService.doRelease(connection);
                return reject(err);
              }
              else {
                dataBaseService.doRelease(connection);
                return resolve(result);
              }
            });
        });
    })
  },
  AddDataOrderFalloutTask(query, jSonData) {
    return new Promise((resolve, reject) => {
      oracledb.getConnection(
        {
          user: dbConfig.user,
          password: dbConfig.password,
          connectString: dbConfig.connectString
        },
        function (err, connection) {
          if (err) {
            dataBaseService.doRelease(connection);
            return reject(err)
          }
          connection.execute(query, jSonData,
            {
              autoCommit: true,
              outFormat: oracledb.OBJECT
            },
            function (err, result) {
              if (err) {
                dataBaseService.doRelease(connection);
                return reject(err)
              } else {
                dataBaseService.doRelease(connection);
                return resolve(result);
              }
            });
        });
    })
  },
  doRelease(connection) {
    connection.close(
      function (err) {
        if (err) { console.error(err.message); }
      });
  },

  doClose(connection, resultSet) {
    resultSet.close(
      function (err) {
        if (err) { console.error(err.message); }
        doRelease(connection);
      });
  }
}
module.exports = dataBaseService;