import express from 'express';
import cors from 'cors';
import { getConnection, mssql } from './conexion.mjs';

const app = express();
app.use(express.json());
app.use(cors());

// --- FUNCIÓN AUXILIAR PARA CONSULTAS ---
const ejecutarQuery = async (query, params = []) => {
    const pool = await getConnection();
    const request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    return await request.query(query);
};

// --- RUTAS DE LOGIN ---
app.post('/login', async (req, res, next) => {
    const { user, password } = req.body;
    try {
        const query = 'SELECT Usuario, Nombre, ID_Tipo_Usuario as tipo FROM Usuario WHERE Usuario = @usuario AND Clave = @clave';
        const result = await ejecutarQuery(query, [
            { name: 'usuario', type: mssql.VarChar, value: user },
            { name: 'clave', type: mssql.VarChar, value: password }
        ]);

        if (result.recordset.length > 0) {
            res.json({ success: true, tipo: result.recordset[0].tipo, nombre: result.recordset[0].Nombre });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) { next(error); }
});

// --- RUTAS DE CADENAS ---
app.get('/api/tipos-cadena', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Tipo FROM Tipo_Cadena");
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.get('/api/cadenas', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Nombre FROM Cadena");
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.post('/api/agregar-cadena', async (req, res, next) => {
    const { nombre, tipo } = req.body;
    try {
        const query = `
            IF EXISTS (SELECT 1 FROM Cadena WHERE Nombre = @nombre)
                SELECT 'EXISTE' as Resultado
            ELSE
                BEGIN
                    DECLARE @idTipo INT = (SELECT ID FROM Tipo_Cadena WHERE Tipo = @tipoNombre);
                    INSERT INTO Cadena (Nombre, ID_Tipo) VALUES (@nombre, @idTipo);
                    SELECT 'OK' as Resultado
                END`;
        
        const result = await ejecutarQuery(query, [
            { name: 'nombre', type: mssql.VarChar, value: nombre },
            { name: 'tipoNombre', type: mssql.VarChar, value: tipo }
        ]);

        if (result.recordset[0].Resultado === 'EXISTE') {
            return res.status(400).json({ success: false, message: `La cadena "${nombre}" ya está registrada.` });
        }
        res.json({ success: true, message: "Cadena guardada correctamente" });
    } catch (error) { next(error); }
});

app.delete('/api/eliminar-cadena/:id', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("DELETE FROM Cadena WHERE ID = @id", [
            { name: 'id', type: mssql.TinyInt, value: req.params.id }
        ]);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ success: false, message: "No existe" });
        res.json({ success: true, message: "Cadena y sucursales eliminadas" });
    } catch (error) { next(error); }
});

// --- RUTAS DE SUCURSALES ---
app.get('/api/subzonas', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Nombre FROM Subzona");
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.get('/api/buscar-sucursales', async (req, res, next) => {
    const { id_cadena, id_subzona } = req.query;
    try {
        const query = "SELECT ID, Calle, Altura, Localidad FROM Sucursal WHERE ID_Cadena = @id_cadena AND ID_Subzona = @id_subzona";
        const result = await ejecutarQuery(query, [
            { name: 'id_cadena', type: mssql.TinyInt, value: id_cadena },
            { name: 'id_subzona', type: mssql.TinyInt, value: id_subzona }
        ]);
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.post('/api/agregar-sucursal', async (req, res, next) => {
    const { calle, altura, localidad, id_subzona, id_cadena } = req.body;
    try {
        const checkQuery = "SELECT ID FROM Sucursal WHERE Calle = @calle AND Altura = @altura AND ID_Cadena = @id_cadena";
        const existe = await ejecutarQuery(checkQuery, [
            { name: 'calle', type: mssql.VarChar, value: calle },
            { name: 'altura', type: mssql.Int, value: altura },
            { name: 'id_cadena', type: mssql.TinyInt, value: id_cadena }
        ]);

        if (existe.recordset.length > 0) return res.status(400).json({ success: false, message: "Ya registrada" });

        const insertQuery = "INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES (@calle, @altura, @localidad, @id_subzona, @id_cadena)";
        await ejecutarQuery(insertQuery, [
            { name: 'calle', type: mssql.VarChar, value: calle },
            { name: 'altura', type: mssql.Int, value: altura },
            { name: 'localidad', type: mssql.VarChar, value: localidad },
            { name: 'id_subzona', type: mssql.TinyInt, value: id_subzona },
            { name: 'id_cadena', type: mssql.TinyInt, value: id_cadena }
        ]);
        res.json({ success: true, message: "Sucursal guardada" });
    } catch (error) { next(error); }
});

app.delete('/api/eliminar-sucursal/:id', async (req, res, next) => {
    try {
        await ejecutarQuery("DELETE FROM Sucursal WHERE ID = @id", [
            { name: 'id', type: mssql.SmallInt, value: req.params.id }
        ]);
        res.json({ success: true, message: "Eliminada correctamente" });
    } catch (error) { next(error); }
});

// --- MANEJO GLOBAL DE ERRORES ---
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: "Error interno del servidor", error: err.message });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));