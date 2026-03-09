import mssql from "mssql";

const connectionSettings = {
    server: "localhost",
    database: "Sistema_Solvens",
    user: "sa",
    password: "botta2212",
    options: {
        instanceName: "SQLEXPRESS",
        trustServerCertificate: true,
        encrypt: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

let pool = null;

export async function getConnection() {
    try {

        if (!pool) {
            pool = await mssql.connect(connectionSettings);
            console.log("✅ Conectado a SQL Server");
        }

        return pool;

    } catch (error) {
        console.error("❌ Error de conexión a SQL Server:", error);
        throw error;
    }
}

export { mssql };