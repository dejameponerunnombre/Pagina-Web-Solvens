import { getConnection, mssql } from "./conexion.mjs";

const getUser = async ()=> {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * from Usuario");
        console.log(result);
    }
    catch(error){
        console.error(error);
    }
}


getUser();