import mssql from "mssql";

const connectionSettings = {
    server: "127.0.0.1",
    port: 1433,
    database: "Sistema_Solvens",
    user: "sa",
    password: "botta2212",
    options: {
        encrypt: true,
        trustServerCertificate: true,
        instancename: "SQLEXPRESS"
    }
};


export async function getConnection(){
    try{
        return await mssql.connect(connectionSettings);
    }
    catch(error){
        console.error(error);
    }
}

export {mssql};