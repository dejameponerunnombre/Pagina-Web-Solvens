import express from 'express';
import cors from 'cors';
import { getConnection, mssql } from './conexion.mjs';

const app = express();
app.use(express.json());
app.use(cors());

// --- RUTAS (Deben ir antes del listen) ---

// 1. Login
app.post('/login', async (req, res) => {
    const { user, password } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('usuario', mssql.VarChar, user)
            .input('clave', mssql.VarChar, password)
            .query('SELECT Usuario, Nombre, ID_Tipo_Usuario as tipo FROM Usuario WHERE Usuario = @usuario AND Clave = @clave');

        if (result.recordset.length > 0) {
            res.json({ success: true, tipo: result.recordset[0].tipo, nombre: result.recordset[0].Nombre });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

// 2. Obtener Tipos de Cadena (GET)
app.get('/api/tipos-cadena', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT Tipo FROM Tipo_Cadena");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

// 3. Agregar Nueva Cadena (POST)
app.post('/api/agregar-cadena', async (req, res) => {
    const { nombre, tipo } = req.body;
    
    try {
        const pool = await getConnection();

        // 1. VALIDACIÓN: Verificar si el nombre de la cadena ya existe
        const existeCadena = await pool.request()
            .input('nombreCheck', mssql.VarChar, nombre)
            .query("SELECT Nombre FROM Cadena WHERE Nombre = @nombreCheck");

        if (existeCadena.recordset.length > 0) {
            // Si el nombre ya está en la base de datos, detenemos el proceso
            return res.status(400).json({ 
                success: false, 
                message: `La cadena "${nombre}" ya está registrada.` 
            });
        }

        // 2. BUSCAR EL ID_TIPO (Lo que ya teníamos)
        const consultaTipo = await pool.request()
            .input('tipoNombre', mssql.VarChar, tipo)
            .query("SELECT ID FROM Tipo_Cadena WHERE Tipo = @tipoNombre");

        if (consultaTipo.recordset.length === 0) {
            return res.status(400).json({ success: false, message: "El tipo de cadena no existe" });
        }

        const idTipo = consultaTipo.recordset[0].ID;

        // 3. INSERTAR (Ahora es seguro porque validamos el nombre arriba)
        await pool.request()
            .input('nombre', mssql.VarChar, nombre)
            .input('idTipo', mssql.Int, idTipo)
            .query("INSERT INTO Cadena (Nombre, ID_Tipo) VALUES (@nombre, @idTipo)");

        res.json({ success: true, message: "Cadena guardada correctamente" });

    } catch (error) {
        console.error("Error detallado:", error.message);
        res.status(500).json({ success: false, message: "Error en el servidor: " + error.message });
    }
});


// 1. Obtener Cadenas (para el select de sucursales)
app.get('/api/cadenas', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT ID, Nombre FROM Cadena");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener cadenas" });
    }
});

// 2. Obtener Subzonas (para el select de localidad/provincia)
app.get('/api/subzonas', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT ID, Nombre FROM Subzona");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener subzonas" });
    }
});

// 3. Guardar Sucursal con validación de duplicados
app.post('/api/agregar-sucursal', async (req, res) => {
    const { calle, altura, localidad, id_subzona, id_cadena } = req.body;
    try {
        const pool = await getConnection();

        // Validación: No repetir misma calle y altura para la misma cadena
        const existe = await pool.request()
            .input('calle', mssql.VarChar, calle)
            .input('altura', mssql.Int, altura)
            .input('id_cadena', mssql.TinyInt, id_cadena)
            .query("SELECT ID FROM Sucursal WHERE Calle = @calle AND Altura = @altura AND ID_Cadena = @id_cadena");

        if (existe.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "Esta sucursal ya se encuentra registrada." });
        }

        await pool.request()
            .input('calle', mssql.VarChar, calle)
            .input('altura', mssql.Int, altura)
            .input('localidad', mssql.VarChar, localidad)
            .input('id_subzona', mssql.TinyInt, id_subzona)
            .input('id_cadena', mssql.TinyInt, id_cadena)
            .query(`INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) 
                    VALUES (@calle, @altura, @localidad, @id_subzona, @id_cadena)`);

        res.json({ success: true, message: "Sucursal guardada con éxito" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor: " + error.message });
    }
});

// 1. Obtener sucursales filtradas por Cadena y Subzona
app.get('/api/buscar-sucursales', async (req, res) => {
    const { id_cadena, id_subzona } = req.query;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_cadena', mssql.TinyInt, id_cadena)
            .input('id_subzona', mssql.TinyInt, id_subzona)
            .query(`SELECT ID, Calle, Altura, Localidad 
                    FROM Sucursal 
                    WHERE ID_Cadena = @id_cadena AND ID_Subzona = @id_subzona`);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar sucursales" });
    }
});

// 2. Eliminar sucursal por ID
app.delete('/api/eliminar-sucursal/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', mssql.SmallInt, id)
            .query("DELETE FROM Sucursal WHERE ID = @id");
        res.json({ success: true, message: "Sucursal eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al eliminar: " + error.message });
    }
});
// Eliminar Cadena (y sus sucursales por cascada en BD)
app.delete('/api/eliminar-cadena/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        
        // Al ejecutar este DELETE, si configuraste ON DELETE CASCADE,
        // SQL Server borrará automáticamente todas las sucursales vinculadas.
        const result = await pool.request()
            .input('id', mssql.TinyInt, id)
            .query("DELETE FROM Cadena WHERE ID = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: "La cadena no existe." });
        }

        res.json({ success: true, message: "Cadena y todas sus sucursales eliminadas con éxito." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error al eliminar la cadena." });
    }
});

// --- EL SERVIDOR SE INICIA AL FINAL ---
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));