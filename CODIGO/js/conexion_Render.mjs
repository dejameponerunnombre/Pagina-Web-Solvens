import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on("connect", () => console.log("✅ Conectado a PostgreSQL"));
pool.on("error", (err) => console.error("❌ Error de conexión a PostgreSQL:", err));

/**
 * Ejecuta una query con parámetros posicionales.
 * @param {string} text - Query con $1, $2, ...
 * @param {Array}  params - Array de valores
 */
export async function query(text, params = []) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

/**
 * Devuelve un cliente de la pool para transacciones manuales.
 * Recordá llamar client.release() al terminar.
 */
export async function getClient() {
    return await pool.connect();
}

export default pool;
