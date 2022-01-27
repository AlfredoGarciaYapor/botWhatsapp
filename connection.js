const sql = require('mssql');

const dbSettings = {
    user: "wabot",
    password: "Bw@c3Ll-ULch",
    server: "201.174.71.51",
    storedProcedure: "sp_getCellPhone",
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
      }
}

async function getConnection(){
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().query(dbSettings.storedProcedure);
    console.log(result);
}

getConnection();