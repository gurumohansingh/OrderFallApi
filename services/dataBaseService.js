var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var async = require('async');
var Promise = require('promise');
// Number of rows to return from each call to getRows()
var numRows = 1;
var dataBaseService = {
  ReadData(query, option) {
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
          connection.execute(query, option,
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
  },
  ReadLobData(query, option,fetchInfoFormat) {
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
          connection.execute(query, option,
            { outFormat: oracledb.OBJECT ,
              fetchInfo:fetchInfoFormat
            },
            function (err, result) {
              if (err) {
                dataBaseService.doRelease(connection);
                return reject(err);
              }
              else {
              
                return resolve(result);
              }
            });
        });
    })
  },
  dostream(conn, clob, cb) {
    var errorHandled = false;
    var myclob = "";

    clob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
    clob.on(
      'error',
      function (err) {
        if (!errorHandled) {
          errorHandled = true;
          clob.close(function () {
            return cb(err, conn);
          });
        }
      });
    clob.on(
      'data',
      function (chunk) {

        myclob += chunk; // or use Buffer.concat() for BLOBS
      });
    clob.on(
      'end',
      function () {
        console.log("clob.on 'end' event");
        console.log(myclob);
      });
    clob.on(
      'close',
      function () {
        console.log("clob.on 'close' event");
        if (!errorHandled) {
          return cb(null, conn);
        }
      });
  }
}
module.exports = dataBaseService;