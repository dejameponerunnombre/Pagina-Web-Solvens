import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
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


// --- RUTAS DE CADENAS ---
app.get('/api/tipos-cadena', async (req, res) => {
    try {
        const pool = await getConnection();
        // Agregamos ID para que el select del frontend funcione
        const result = await pool.request().query("SELECT ID, Tipo FROM Tipo_Cadena");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar tipos" });
    }
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

app.get('/api/buscar-sucursales', async (req, res) => {
    const { id_cadena, id_subzona } = req.query;
    try {
        const pool = await getConnection();
        
        // Hacemos que la subzona sea opcional para que funcione al crear usuarios
        let query = "SELECT ID, Calle, Altura, Localidad FROM Sucursal WHERE ID_Cadena = @id_cadena";
        const request = pool.request().input('id_cadena', mssql.TinyInt, id_cadena);

        if (id_subzona && id_subzona !== 'undefined') {
            query += " AND ID_Subzona = @id_subzona";
            request.input('id_subzona', mssql.TinyInt, id_subzona);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar sucursales" });
    }
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

app.get('/api/tipos-usuario', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Tipo FROM Tipo_Usuario");
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.post('/api/crear-usuario', async (req, res, next) => {
    // Añadimos sucursalesIds al body
    const { nombre, id_tipo, mail, usuario, clave, sucursalesIds } = req.body; 
    
    try {
        const pool = await getConnection();
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Insertar el Usuario y obtener su ID
            const userResult = await transaction.request()
                .input('nom', mssql.VarChar, nombre)
                .input('tipo', mssql.TinyInt, id_tipo)
                .input('mail', mssql.VarChar, mail)
                .input('user', mssql.VarChar, usuario)
                .input('pass', mssql.VarChar, clave)
                .query(`INSERT INTO Usuario (Nombre, ID_Tipo_Usuario, Mail, Usuario, Clave) 
                        OUTPUT INSERTED.ID
                        VALUES (@nom, @tipo, @mail, @user, @pass)`);

            const newUserId = userResult.recordset[0].ID;

            // 2. Si es cliente y tiene sucursales, insertar en Abastece
            if (sucursalesIds && sucursalesIds.length > 0) {
                for (const sucursalId of sucursalesIds) {
                    await transaction.request()
                        .input('uId', mssql.SmallInt, newUserId)
                        .input('sId', mssql.SmallInt, sucursalId)
                        .query("INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES (@uId, @sId)");
                }
            }

            await transaction.commit();
            res.json({ success: true, message: "Usuario y asignaciones creados con éxito." });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) { next(error); }
});

app.get('/api/categorias', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Categoria FROM Categoria");
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.get('/api/buscar-categorias', async (req, res, next) => {
    const { q } = req.query; // El término de búsqueda
    try {
        const query = "SELECT ID, Categoria FROM Categoria WHERE Categoria LIKE @termino";
        const result = await ejecutarQuery(query, [
            { name: 'termino', type: mssql.VarChar, value: `%${q}%` }
        ]);
        res.json(result.recordset);
    } catch (error) { next(error); }
});

// Agregar una nueva categoría
app.post('/api/agregar-categoria', async (req, res, next) => {
    const { categoria } = req.body;
    try {
        // Validamos si ya existe
        const check = await ejecutarQuery("SELECT 1 FROM Categoria WHERE Categoria = @cat", [
            { name: 'cat', type: mssql.VarChar, value: categoria }
        ]);

        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: "La categoría ya existe." });
        }

        await ejecutarQuery("INSERT INTO Categoria (Categoria) VALUES (@cat)", [
            { name: 'cat', type: mssql.VarChar, value: categoria }
        ]);
        
        res.json({ success: true, message: "Categoría creada con éxito." });
    } catch (error) { next(error); }
});

// Eliminar categoría
app.delete('/api/eliminar-categoria/:id', async (req, res, next) => {
    try {
        await ejecutarQuery("DELETE FROM Categoria WHERE ID = @id", [
            { name: 'id', type: mssql.TinyInt, value: req.params.id }
        ]);
        res.json({ success: true, message: "Categoría eliminada." });
    } catch (error) { next(error); }
});


// --- RUTAS DE PRODUCTOS ---

// A. Obtener usuarios por tipo (Necesario para el selector de Clientes)
app.get('/api/usuarios', async (req, res, next) => {
    const { tipo } = req.query;
    try {
        const query = "SELECT ID, Nombre FROM Usuario WHERE ID_Tipo_Usuario = @tipo";
        const result = await ejecutarQuery(query, [
            { name: 'tipo', type: mssql.TinyInt, value: tipo }
        ]);
        res.json(result.recordset);
    } catch (error) { next(error); }
});

// B. Agregar Producto
app.post('/api/agregar-producto', async (req, res, next) => {
    const { id_cliente, descripcion, id_categoria, sku } = req.body;
    try {
        const query = `INSERT INTO Producto (ID_Cliente, Descripcion, ID_Categoria, SKU) 
                       VALUES (@uId, @desc, @catId, @sku)`;
        await ejecutarQuery(query, [
            { name: 'uId', type: mssql.SmallInt, value: id_cliente },
            { name: 'desc', type: mssql.VarChar, value: descripcion },
            { name: 'catId', type: mssql.TinyInt, value: id_categoria },
            { name: 'sku', type: mssql.VarChar, value: sku }
        ]);
        res.json({ success: true, message: "Producto registrado con éxito." });
    } catch (error) { next(error); }
});

// C. Buscar y Eliminar Productos
app.get('/api/buscar-productos', async (req, res, next) => {
    const { q } = req.query;
    try {
        const query = `
            SELECT p.ID, p.Descripcion, p.SKU, u.Nombre as Cliente 
            FROM Producto p
            JOIN Usuario u ON p.ID_Cliente = u.ID
            WHERE p.Descripcion LIKE @termino OR p.SKU LIKE @termino`;
        const result = await ejecutarQuery(query, [
            { name: 'termino', type: mssql.VarChar, value: `%${q}%` }
        ]);
        res.json(result.recordset);
    } catch (error) { next(error); }
});

app.delete('/api/eliminar-producto/:id', async (req, res, next) => {
    try {
        await ejecutarQuery("DELETE FROM Producto WHERE ID = @id", [
            { name: 'id', type: mssql.SmallInt, value: req.params.id }
        ]);
        res.json({ success: true, message: "Producto eliminado correctamente." });
    } catch (error) { next(error); }
});



// --- RUTA DE BUSQUEDA DE USUARIOS ---
app.get('/api/buscar-usuarios-eliminar', async (req, res, next) => {
    const { q } = req.query;
    try {
        const query = `SELECT u.ID, u.Nombre, u.Usuario, t.Tipo 
                       FROM Usuario u JOIN Tipo_Usuario t ON u.ID_Tipo_Usuario = t.ID
                       WHERE u.Nombre LIKE @q OR u.Usuario LIKE @q`;
        const result = await ejecutarQuery(query, [{ name: 'q', type: mssql.VarChar, value: `%${q}%` }]);
        res.json(result.recordset);
    } catch (error) { next(error); }
});


// --- ELIMINAR USUARIO ---
app.delete('/api/eliminar-usuario/:id', async (req, res, next) => {
    try {
        await ejecutarQuery("DELETE FROM Usuario WHERE ID = @id", [
            { name: 'id', type: mssql.SmallInt, value: req.params.id }
        ]);
        res.json({ success: true, message: "Usuario eliminado con éxito." });
    } catch (error) { next(error); }
});

// A. LOGIN: Ahora devuelve el ID para guardarlo en el navegador
app.post('/login', async (req, res, next) => {
    const { user, password } = req.body;
    try {
        const query = 'SELECT ID, Nombre, ID_Tipo_Usuario as tipo FROM Usuario WHERE Usuario = @usuario AND Clave = @clave';
        const result = await ejecutarQuery(query, [
            { name: 'usuario', type: mssql.VarChar, value: user },
            { name: 'clave', type: mssql.VarChar, value: password }
        ]);

        if (result.recordset.length > 0) {
            res.json({ 
                success: true, 
                id: result.recordset[0].ID, 
                tipo: result.recordset[0].tipo, 
                nombre: result.recordset[0].Nombre 
            });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) { next(error); }
});

// B. SUCURSALES: Filtra por cliente usando la tabla Abastece
app.get('/api/mis-sucursales', async (req, res, next) => {
    const { id_cliente } = req.query;
    try {
        const query = `
            SELECT s.ID, s.Calle, s.Altura, s.Localidad 
            FROM Sucursal s
            JOIN Abastece a ON s.ID = a.ID_Sucursal
            WHERE a.ID_Cliente = @cli`;
        const result = await ejecutarQuery(query, [{ name: 'cli', type: mssql.SmallInt, value: id_cliente }]);
        res.json(result.recordset);
    } catch (e) { next(e); }
});

// C. PRODUCTOS: Obtiene los productos del cliente seleccionado
app.get('/api/productos-cliente', async (req, res, next) => {
    const { id_cliente } = req.query;
    try {
        const query = "SELECT ID, Descripcion FROM Producto WHERE ID_Cliente = @cli";
        const result = await ejecutarQuery(query, [{ name: 'cli', type: mssql.SmallInt, value: id_cliente }]);
        res.json(result.recordset);
    } catch (e) { next(e); }
});

// D. GUARDAR VISITA: Maneja la transacción completa
// Ruta de carga en server.mjs
const storage = multer.memoryStorage(); 
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB por archivo
});

app.post('/api/cargar-visita', upload.array('imagenes', 3), async (req, res, next) => {
    // 1. Extraer datos (Importante: productos viene como STRING en FormData)
    const { id_repo, id_cliente, id_sucursal, productos } = req.body;
    
    if (!productos) return res.status(400).json({ success: false, error: "No hay productos" });

    const listaProd = JSON.parse(productos);
    const pool = await getConnection();
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // A. INSERTAR VISITA
        const vRes = await transaction.request()
            .input('f', mssql.Date, new Date())
            .input('r', mssql.SmallInt, id_repo)
            .input('c', mssql.SmallInt, id_cliente)
            .input('s', mssql.SmallInt, id_sucursal)
            .query(`INSERT INTO Visita (Fecha, ID_Repo, ID_Cliente, ID_Sucursal) 
                    OUTPUT INSERTED.ID VALUES (@f,@r,@c,@s)`);
        
        const vId = vRes.recordset[0].ID;

        // B. INSERTAR EN TABLA CARGA (Aquí estaba el fallo)
        for (const p of listaProd) {
            await transaction.request()
                .input('pre', mssql.Decimal(10,2), p.precio)
                .input('pId', mssql.SmallInt, p.id_prod)
                .input('vId', mssql.Int, vId)
                .input('ofe', mssql.Bit, p.oferta ? 1 : 0)
                .query(`INSERT INTO Carga (Precio, ID_Producto, ID_Visita, Estado, Oferta) 
                        VALUES (@pre, @pId, @vId, 'Pendiente', @ofe)`);
        }

        // C. PROCESAR IMÁGENES CON SHARP (Solo si existen)
        if (req.files && req.files.length > 0) {
            const fechaHoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            
            for (const f of req.files) {
                const nroRandom = Math.floor(10000 + Math.random() * 90000);
                const nuevoNombre = `${fechaHoy}_${vId}_${nroRandom}.jpg`;
                const rutaDestino = path.join('IMG', nuevoNombre);

                // Comprimir y guardar
                await sharp(f.buffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(rutaDestino);

                // Guardar en tabla Imagen
                await transaction.request()
                    .input('ruta', mssql.VarChar, nuevoNombre)
                    .input('vId', mssql.Int, vId)
                    .query("INSERT INTO Imagen (Ruta_Imagen, ID_Visita) VALUES (@ruta, @vId)");
            }
        }

        await transaction.commit();
        res.json({ success: true, message: "Visita y productos guardados" });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("Error al guardar carga:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
// Agrega esta ruta específica para que el 404 desaparezca
app.get('/api/clientes-activos', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Nombre FROM Usuario WHERE ID_Tipo_Usuario = 2");
        res.json(result.recordset);
    } catch (e) { next(e); }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));