import mssql from "mssql";

const connectionSettings = {
    server: "localhost",
    port: 1433,
    database: "Sistema_Solvens",
    user: "sa",
    password: "botta2212",
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};
export async function getConnection() {
    try {
        return await mssql.connect(connectionSettings);
    }
    catch (error) {
        console.error("Error de conexión a SQL Server:", error);
    }
}

export { mssql };