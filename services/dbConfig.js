module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "system",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "Dadarwal6",  
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost/orcl",   
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };