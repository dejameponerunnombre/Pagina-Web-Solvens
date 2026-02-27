import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import bcrypt from 'bcrypt';
import { getConnection, mssql } from './conexion.mjs';

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos del frontend
app.use(express.static('CODIGO'));
app.use('/IMG', express.static('IMG'));

// ensure password column can hold bcrypt hashes (≈60 chars)
(async () => {
    try {
        const pool = await getConnection();
        // check length, if too small alter column
        await pool.request().query(`
            IF COL_LENGTH('Usuario','Clave') IS NOT NULL AND
               COL_LENGTH('Usuario','Clave') < 100
            BEGIN
                ALTER TABLE Usuario ALTER COLUMN Clave VARCHAR(200);
            END
        `);
        console.log('password column size verified/updated');
    } catch (err) {
        console.error('error ensuring Clave column length', err);
    }
})();

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
        let query = 'SELECT ID, Calle AS "Calle", Altura AS "Altura", Localidad AS "Localidad" FROM Sucursal WHERE ID_Cadena = @id_cadena'; const request = pool.request().input('id_cadena', mssql.Int, id_cadena); // Cambiado a Int por seguridad

        // Validación más robusta para evitar que 'undefined' o 'null' rompan la consulta
        if (id_subzona && id_subzona !== 'undefined' && id_subzona !== 'null' && id_subzona !== '') {
            query += " AND ID_Subzona = @id_subzona";
            request.input('id_subzona', mssql.Int, id_subzona);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error("Error SQL:", error); // Esto te ayudará a ver el error real en la terminal
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
    const { nombre, id_tipo, mail, usuario, clave, sucursalesIds } = req.body;

    try {
        const pool = await getConnection();

        // 1. VALIDACIÓN: Verificar si el usuario o el mail ya existen
        const existe = await pool.request()
            .input('u', mssql.VarChar, usuario)
            .input('m', mssql.VarChar, mail)
            .query("SELECT Usuario, Mail FROM Usuario WHERE Usuario = @u OR Mail = @m");

        if (existe.recordset.length > 0) {
            const duplicado = existe.recordset[0];
            let msg = "El registro ya existe.";

            if (duplicado.Usuario === usuario) msg = "El nombre de usuario ya está en uso.";
            else if (duplicado.Mail === mail) msg = "El correo electrónico ya está registrado.";

            return res.status(400).json({
                success: false,
                message: msg
            });
        }

        // HASH DEL PASSWORD ANTES DE INSERTAR
        const hashedPass = await bcrypt.hash(clave, 10);

        // 2. INICIO DE TRANSACCIÓN (Si pasó la validación)
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();

        try {
            // 3. Insertar el Usuario y obtener su ID
            const userResult = await transaction.request()
                .input('nom', mssql.VarChar, nombre)
                .input('tipo', mssql.TinyInt, id_tipo)
                .input('mail', mssql.VarChar, mail)
                .input('user', mssql.VarChar, usuario)
                .input('pass', mssql.VarChar, hashedPass)
                .query(`INSERT INTO Usuario (Nombre, ID_Tipo_Usuario, Mail, Usuario, Clave) 
                        OUTPUT INSERTED.ID
                        VALUES (@nom, @tipo, @mail, @user, @pass)`);

            const newUserId = userResult.recordset[0].ID;

            // 4. Si tiene sucursales asignadas (Rol Cliente), insertar en Abastece
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
            throw error; // Re-lanzar para que lo atrape el catch externo
        }
    } catch (error) {
        console.error("Error en crear-usuario:", error);
        next(error);
    }
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
        const query = 'SELECT ID, Nombre, ID_Tipo_Usuario as tipo, Clave FROM Usuario WHERE Usuario = @usuario';
        const result = await ejecutarQuery(query, [
            { name: 'usuario', type: mssql.VarChar, value: user }
        ]);

        if (result.recordset.length > 0) {
            const userRec = result.recordset[0];
            let match = false;
            // si ya hay hash, comparar con bcrypt
            if (userRec.Clave && userRec.Clave.startsWith('$2')) {
                match = await bcrypt.compare(password, userRec.Clave);
            } else {
                // contraseña en texto plano (legacy)
                match = (password === userRec.Clave);
            }
            if (match) {
                // si era legacy, re-hash y actualizar en BD para futuras logins
                if (!(userRec.Clave && userRec.Clave.startsWith('$2'))) {
                    const hashed = await bcrypt.hash(password, 10);
                    await ejecutarQuery('UPDATE Usuario SET Clave = @pass WHERE ID = @id', [
                        { name: 'pass', type: mssql.VarChar, value: hashed },
                        { name: 'id', type: mssql.SmallInt, value: userRec.ID }
                    ]);
                }
                return res.json({
                    success: true,
                    id: userRec.ID,
                    tipo: userRec.tipo,
                    nombre: userRec.Nombre
                });
            }
        }
        res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
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

// IMÁGENES APROBADAS POR CLIENTE
app.get('/api/imagenes-aprobadas-cliente', async (req, res, next) => {
    const { id_cliente } = req.query;
    if (!id_cliente) return res.status(400).json({ error: 'Falta id_cliente' });
    try {
        // validar que se trate de un cliente
        const check = await ejecutarQuery(`
            SELECT ID FROM Usuario WHERE ID = @id
              AND ID_Tipo_Usuario = (SELECT ID FROM Tipo_Usuario WHERE Tipo = 'Cliente')
        `, [{ name: 'id', type: mssql.SmallInt, value: id_cliente }]);
        if (check.recordset.length === 0)
            return res.status(403).json({ error: 'Acceso no autorizado' });

        const query = `
            SELECT v.ID AS idVisita,
                   v.Fecha,
                   uRepo.Nombre AS Repositor,
                   ca.Nombre AS Cadena,
                   s.Localidad,
                   s.Calle + ' ' + ISNULL(CAST(s.Altura AS VARCHAR),'') AS Sucursal,
                   im.ID          AS idImagen,
                   im.Ruta_Imagen,
                   im.Estado      AS EstadoImagen
            FROM Visita v
            JOIN Usuario uRepo ON v.ID_Repo = uRepo.ID
            JOIN Sucursal s   ON v.ID_Sucursal = s.ID
            JOIN Cadena ca    ON s.ID_Cadena = ca.ID
            JOIN Imagen im    ON im.ID_Visita = v.ID
            WHERE v.ID_Cliente = @id
              AND im.Estado = 'Aprobado'
            ORDER BY v.Fecha DESC
        `;
        const result = await ejecutarQuery(query, [{ name: 'id', type: mssql.SmallInt, value: id_cliente }]);
        // agrupar por visita
        const grouped = {};
        result.recordset.forEach(r => {
            if (!grouped[r.idVisita]) {
                grouped[r.idVisita] = {
                    id: r.idVisita,
                    fecha: r.Fecha,
                    repositor: r.Repositor,
                    cadena: r.Cadena,
                    localidad: r.Localidad,
                    sucursal: r.Sucursal,
                    imagenes: []
                };
            }
            grouped[r.idVisita].imagenes.push({
                id: r.idImagen,
                ruta: r.Ruta_Imagen,
                estado: r.EstadoImagen
            });
        });
        res.json(Object.values(grouped));
    } catch (e) { next(e); }
});

// IMÁGENES (TODAS) PARA ADMINISTRACIÓN
app.get('/api/imagenes-visitas', async (req, res, next) => {
    try {
        const query = `
            SELECT v.ID AS idVisita,
                   v.Fecha,
                   uRepo.Nombre AS Repositor,
                   uCliente.Nombre AS Cliente,
                   ca.Nombre AS Cadena,
                   s.Localidad,
                   s.Calle + ' ' + ISNULL(CAST(s.Altura AS VARCHAR),'') AS Sucursal,
                   im.ID           AS idImagen,
                   im.Ruta_Imagen,
                   im.Estado       AS EstadoImagen,
                   c.Estado AS EstadoCarga
            FROM Visita v
            JOIN Usuario uRepo   ON v.ID_Repo = uRepo.ID
            JOIN Usuario uCliente ON v.ID_Cliente = uCliente.ID
            JOIN Sucursal s      ON v.ID_Sucursal = s.ID
            JOIN Cadena ca       ON s.ID_Cadena = ca.ID
            JOIN Imagen im       ON im.ID_Visita = v.ID
            LEFT JOIN Carga c    ON c.ID_Visita = v.ID
            ORDER BY v.Fecha DESC
        `;
        const result = await ejecutarQuery(query);
        // console.log('imagenes-visitas rows returned', result.recordset.length);
        // if (result.recordset.length > 0) console.log('imagenes-visitas sample row', result.recordset[0]);
        const grouped = {};
        result.recordset.forEach(r => {
            if (!grouped[r.idVisita]) {
                grouped[r.idVisita] = {
                    id: r.idVisita,
                    fecha: r.Fecha,
                    repositor: r.Repositor,
                    cliente: r.Cliente,
                    cadena: r.Cadena,
                    localidad: r.Localidad,
                    sucursal: r.Sucursal,
                    estadoCarga: r.EstadoCarga || 'Pendiente',
                    imagenes: []
                };
            }
            grouped[r.idVisita].imagenes.push({
                id: r.idImagen,
                ruta: r.Ruta_Imagen,
                estado: r.EstadoImagen || 'Pendiente'
            });
        });
        res.json(Object.values(grouped));
    } catch (e) { next(e); }
});

// APROBAR VISITA (ya existe)

// RECHAZAR VISITA
app.patch('/api/rechazar-visita/:id', async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    try {
        const result = await ejecutarQuery(
            `UPDATE Carga SET Estado = 'Rechazado' WHERE ID_Visita = @id AND Estado = 'Pendiente'`,
            [{ name: 'id', type: mssql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ success: false, message: 'No se encontraron cargas pendientes para esa visita.' });
        res.json({ success: true, message: `Visita #${id} rechazada correctamente.` });
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
                .input('pre', mssql.Decimal(10, 2), p.precio)
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


// TABLAS Y FILTROS

// revolver carga de imágenes por cliente
app.get('/api/carga-imagenes-por-cliente', async (req, res, next) => {
    const { id_cliente } = req.query;
    if (!id_cliente) return res.status(400).json({ error: 'Falta id_cliente' });
    try {
        // Validar que exista el cliente (opcional pero útil)
        const check = await ejecutarQuery(
            `SELECT 1 FROM Usuario WHERE ID = @id AND ID_Tipo_Usuario = (SELECT ID FROM Tipo_Usuario WHERE Tipo = 'Cliente')`,
            [{ name: 'id', type: mssql.SmallInt, value: id_cliente }]
        );
        if (check.recordset.length === 0)
            return res.status(404).json({ error: 'Cliente no encontrado' });

        // Only include branches that the client abastece (from Abastece table)
        // presenting them as "Cadena - Calle Altura, Localidad" and indicating if images exist
        const query = `
            SELECT DISTINCT s.ID AS idSucursal,
                   c.Nombre + ' - ' + s.Calle + ' ' + ISNULL(CAST(s.Altura AS VARCHAR),'') +
                       ', ' + s.Localidad AS NombreSucursal,
                   CASE WHEN EXISTS (
                        SELECT 1 FROM Visita v2
                        JOIN Imagen im ON im.ID_Visita = v2.ID
                        WHERE v2.ID_Sucursal = s.ID
                          AND v2.ID_Cliente = @id
                   ) THEN 1 ELSE 0 END AS TieneImagenes
            FROM Abastece a
            JOIN Sucursal s ON a.ID_Sucursal = s.ID
            LEFT JOIN Cadena c ON s.ID_Cadena = c.ID
            WHERE a.ID_Cliente = @id
            ORDER BY NombreSucursal
        `;
        const result = await ejecutarQuery(query, [{ name: 'id', type: mssql.SmallInt, value: id_cliente }]);
        // DEBUG: log number of rows and sample output
        console.log('DEBUG carga-imagenes-por-cliente rows=', result.recordset.length);
        if (result.recordset.length) {
            console.log('DEBUG sample row:', result.recordset[0]);
        }
        res.json(result.recordset);
    } catch (e) {
        next(e);
    }
});


// Listado filtros
app.get('/api/zonas', async (req, res, next) => {
    try {
        const result = await ejecutarQuery("SELECT ID, Nombre FROM Zona ORDER BY Nombre");
        res.json(result.recordset);
    } catch (e) { next(e); }
});

// Listado filtros
app.get('/api/sucursales-lista', async (req, res, next) => {
    try {
        const result = await ejecutarQuery(
            "SELECT ID, Calle + ISNULL(' ' + CAST(Altura AS VARCHAR), ' S/N') AS Nombre FROM Sucursal ORDER BY Calle"
        );
        res.json(result.recordset);
    } catch (e) { next(e); }
});

// filtracion
app.get('/api/filtros-opciones', async (req, res, next) => {
    try {
        const [cadenas, sucursales, canales, regiones, categorias] = await Promise.all([
            ejecutarQuery("SELECT ID, Nombre FROM Cadena ORDER BY Nombre"),
            ejecutarQuery("SELECT ID, Calle + ISNULL(' ' + CAST(Altura AS VARCHAR), ' S/N') AS Nombre FROM Sucursal ORDER BY Calle"),
            ejecutarQuery("SELECT ID, Tipo AS Nombre FROM Tipo_Cadena ORDER BY Tipo"),
            ejecutarQuery("SELECT ID, Nombre FROM Zona ORDER BY Nombre"),
            ejecutarQuery("SELECT ID, Categoria AS Nombre FROM Categoria ORDER BY Categoria")
        ]);
        res.json({
            cadenas: cadenas.recordset,
            sucursales: sucursales.recordset,
            canales: canales.recordset,
            regiones: regiones.recordset,
            categorias: categorias.recordset
        });
    } catch (e) { next(e); }
});

// Consulta tabla
const BASE_SELECT_REPORTE = `
    SELECT
        c.ID as ID_Carga,
        v.Fecha,
        ca.Nombre                                       AS Cadena,
        s.Calle + ISNULL(' ' + CAST(s.Altura AS VARCHAR), ' S/N') AS Comercio,
        s.Localidad,
        z.Nombre                                        AS Region,
        sz.Nombre                                       AS Cluster,
        tc.Tipo                                         AS Canal,
        uRepo.Nombre                                    AS Usuario,
        cat.Categoria                                   AS Categoria,
        p.Descripcion                                   AS Producto,
        p.SKU,
        c.Precio,
        CASE WHEN c.Oferta = 1 THEN 'Sí' ELSE 'No' END AS Oferta,
        v.ID                                            AS ID_Visita,
        c.Estado
    FROM Visita v
    JOIN Sucursal s      ON v.ID_Sucursal  = s.ID
    JOIN Cadena ca       ON s.ID_Cadena    = ca.ID
    JOIN Tipo_Cadena tc  ON ca.ID_Tipo     = tc.ID
    JOIN Subzona sz      ON s.ID_Subzona   = sz.ID
    JOIN Zona z          ON sz.ID_Zona     = z.ID
    JOIN Usuario uRepo   ON v.ID_Repo      = uRepo.ID
    JOIN Carga c         ON v.ID           = c.ID_Visita
    JOIN Producto p      ON c.ID_Producto  = p.ID
    JOIN Categoria cat   ON p.ID_Categoria = cat.ID
`;

//  WHERE dinámico según los query parametros recibidos
function buildFiltrosReporte(query, request, extraWhere = '') {
    const { fecha_desde, fecha_hasta, id_cadena, id_sucursal, id_canal, id_region, id_categoria } = query;
    const conds = [];

    if (extraWhere) conds.push(extraWhere);
    if (fecha_desde) { conds.push('v.Fecha >= @fecha_desde'); request.input('fecha_desde', mssql.Date, fecha_desde); }
    if (fecha_hasta) { conds.push('v.Fecha <= @fecha_hasta'); request.input('fecha_hasta', mssql.Date, fecha_hasta); }
    if (id_cadena) { conds.push('ca.ID = @id_cadena'); request.input('id_cadena', mssql.TinyInt, id_cadena); }
    if (id_sucursal) { conds.push('s.ID = @id_sucursal'); request.input('id_sucursal', mssql.SmallInt, id_sucursal); }
    if (id_canal) { conds.push('ca.ID_Tipo = @id_canal'); request.input('id_canal', mssql.TinyInt, id_canal); }
    if (id_region) { conds.push('z.ID = @id_region'); request.input('id_region', mssql.TinyInt, id_region); }
    if (id_categoria) { conds.push('cat.ID = @id_categoria'); request.input('id_categoria', mssql.TinyInt, id_categoria); }

    return conds.length > 0 ? 'WHERE ' + conds.join(' AND ') : '';
}

// TODO , filtros opcionales
app.get('/api/reporte-visitas', async (req, res, next) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        const where = buildFiltrosReporte(req.query, request);
        const result = await request.query(`${BASE_SELECT_REPORTE} ${where} ORDER BY v.Fecha DESC`);
        res.json(result.recordset);
    } catch (e) { next(e); }
});

// Visitas/producto cliente, filtros opcionales
app.get('/api/reporte-visitas-cliente', async (req, res, next) => {
    const { id_cliente } = req.query;
    if (!id_cliente) return res.status(400).json({ error: 'Falta id_cliente' });
    try {
        // Verificar que el ID recibido corresponde a un usuario de tipo 'Cliente'
        const check = await ejecutarQuery(`
            SELECT ID FROM Usuario 
            WHERE ID = @id 
            AND ID_Tipo_Usuario = (SELECT ID FROM Tipo_Usuario WHERE Tipo = 'Cliente')`,
            [{ name: 'id', type: mssql.SmallInt, value: id_cliente }]
        );
        if (check.recordset.length === 0)
            return res.status(403).json({ error: 'Acceso no autorizado' });

        const pool = await getConnection();
        const request = pool.request();
        request.input('id_cliente', mssql.SmallInt, id_cliente);
        const where = buildFiltrosReporte(req.query, request, 'v.ID_Cliente = @id_cliente');
        const result = await request.query(`${BASE_SELECT_REPORTE} ${where} ORDER BY v.Fecha DESC`);
        res.json(result.recordset);
    } catch (e) { next(e); }
});


//  LISTADO DE VISITAS PENDIENTES fila por visita con fecha, repositor, sucursal y cliente
app.get('/api/visitas-pendientes', async (req, res, next) => {
    try {
        const result = await ejecutarQuery(`
            SELECT
                v.ID                                                        AS ID_Visita,
                v.Fecha,
                uRepo.Nombre                                                AS Repositor,
                uCliente.Nombre                                             AS Cliente,
                s.Calle + ' ' + ISNULL(CAST(s.Altura AS VARCHAR), 'S/N')   AS Sucursal
            FROM Visita v
            JOIN Sucursal s       ON v.ID_Sucursal = s.ID
            JOIN Usuario uRepo    ON v.ID_Repo     = uRepo.ID
            JOIN Usuario uCliente ON v.ID_Cliente  = uCliente.ID
            WHERE EXISTS (
                SELECT 1 FROM Carga c
                WHERE c.ID_Visita = v.ID AND c.Estado = 'Pendiente'
            )
            ORDER BY v.Fecha DESC
        `);
        res.json(result.recordset);
    } catch (e) { next(e); }
});



// APROBAR VISITA (legacy, no longer used by UI but retained for compatibility)
app.patch('/api/aprobar-visita/:id', async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    try {
        const result = await ejecutarQuery(
            `UPDATE Carga SET Estado = 'Aprobado' WHERE ID_Visita = @id AND Estado = 'Pendiente'`,
            [{ name: 'id', type: mssql.Int, value: id }]
        );
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ success: false, message: 'No se encontraron cargas pendientes para esa visita.' });
        res.json({ success: true, message: `Visita #${id} aprobada correctamente.` });
    } catch (e) { next(e); }
});

// NUEVO: Cambiar estado de una imagen individual
app.patch('/api/imagen/:id/estado', async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    const { estado } = req.body;
    const valid = ['Pendiente', 'Aprobado', 'Rechazado'];
    if (isNaN(id) || !valid.includes(estado)) {
        return res.status(400).json({ success: false, message: 'ID o estado inválido' });
    }
    try {
        const result = await ejecutarQuery(
            `UPDATE Imagen SET Estado = @estado WHERE ID = @id`,
            [
                { name: 'estado', type: mssql.VarChar, value: estado },
                { name: 'id', type: mssql.Int, value: id }
            ]
        );
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
        res.json({ success: true });
    } catch (e) { next(e); }
});
app.put('/api/actualizar-abastece', async (req, res) => {
    const { id_cliente, sucursalesIds } = req.body;
    const pool = await getConnection();
    const transaction = new mssql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Eliminar asignaciones anteriores
        await transaction.request()
            .input('cli', mssql.SmallInt, id_cliente)
            .query("DELETE FROM Abastece WHERE ID_Cliente = @cli");

        // 2. Insertar las nuevas selecciones
        if (sucursalesIds.length > 0) {
            for (const sId of sucursalesIds) {
                await transaction.request()
                    .input('cli', mssql.SmallInt, id_cliente)
                    .input('suc', mssql.SmallInt, sId)
                    .query("INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES (@cli, @suc)");
            }
        }

        await transaction.commit();
        res.json({ success: true });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
});

// 1. Carga de selectores (Cadenas, Sucursales, etc.)
app.get('/api/filtros-opciones-visitas', async (req, res) => {
    try {
        const pool = await getConnection();
        const [cadenas, sucursales, canales, regiones, clientes] = await Promise.all([
            pool.request().query("SELECT id_cadena AS ID, nombre_cadena AS Nombre FROM cadenas"),
            pool.request().query("SELECT id_sucursal AS ID, nombre_sucursal AS Nombre FROM sucursales"),
            pool.request().query("SELECT id_canal AS ID, nombre_canal AS Nombre FROM canales"),
            pool.request().query("SELECT id_region AS ID, nombre_region AS Nombre FROM regiones"),
            pool.request().query("SELECT id_cliente AS ID, nombre_cliente AS Nombre FROM clientes")
        ]);

        res.json({
            cadenas: cadenas.recordset,
            sucursales: sucursales.recordset,
            canales: canales.recordset,
            regiones: regiones.recordset,
            clientes: clientes.recordset
        });
    } catch (err) {
        console.error("Error en filtros:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/visitas', async (req, res) => {
    const { fecha_desde, fecha_hasta, id_cadena, id_sucursal, id_cliente } = req.query;

    try {
        const pool = await getConnection();
        const request = pool.request();


        let query = `
            SELECT 
                V.ID AS ID_Visita,
                V.Fecha,
                ISNULL(U_REPO.Nombre, 'Sin Repositor') AS Repositor,
                ISNULL(CAD.Nombre, 'S/C') + ' - ' + ISNULL(S.Calle, 'S/N') AS Sucursal,
                ISNULL(U_CLI.Nombre, 'Sin Cliente') AS Cliente
            FROM Visita V
            LEFT JOIN Usuario U_REPO ON V.ID_Repo = U_REPO.ID    -- Primera unión para el Repositor
            LEFT JOIN Usuario U_CLI  ON V.ID_Cliente = U_CLI.ID -- Segunda unión para el Cliente
            LEFT JOIN Sucursal S    ON V.ID_Sucursal = S.ID
            LEFT JOIN Cadena CAD     ON S.ID_Cadena = CAD.ID
            WHERE 1 = 1`;

        // Filtros dinámicos basados en los IDs de la tabla Visita
        if (fecha_desde) {
            query += " AND V.Fecha >= @fdesde";
            request.input('fdesde', mssql.Date, fecha_desde);
        }
        if (fecha_hasta) {
            query += " AND V.Fecha <= @fhasta";
            request.input('fhasta', mssql.Date, fecha_hasta);
        }
        if (id_cadena) {
            query += " AND S.ID_Cadena = @cadena";
            request.input('cadena', mssql.Int, id_cadena);
        }
        if (id_sucursal) {
            query += " AND V.ID_Sucursal = @sucursal";
            request.input('sucursal', mssql.Int, id_sucursal);
        }
        if (id_cliente) {
            query += " AND V.ID_Cliente = @cliente";
            request.input('cliente', mssql.Int, id_cliente);
        }

        query += " ORDER BY V.Fecha DESC";

        const result = await request.query(query);

        console.log(`Enviando ${result.recordset.length} visitas. Registros encontrados para hoy.`);
        res.json(result.recordset);

    } catch (err) {
        console.error("Error en SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});
// 1. API para cargar los selectores del Sidebar
app.get('/api/filtros-opciones', async (req, res) => {
    try {
        const pool = await getConnection(); // Tu función de conexión a SQL Server

        // Ejecutamos las consultas para llenar los filtros
        const cadenas = await pool.request().query("SELECT ID, Nombre FROM Cadena ORDER BY Nombre");
        const sucursales = await pool.request().query("SELECT ID, Calle + ISNULL(' ' + CAST(Altura AS VARCHAR), ' S/N') AS Nombre FROM Sucursal ORDER BY Nombre");

        // Enviamos los datos al frontend
        res.json({
            cadenas: cadenas.recordset,
            sucursales: sucursales.recordset
        });
    } catch (err) {
        console.error("Error en filtros-opciones:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Actualizar Estado (POST)
app.post('/api/visitas/estado', async (req, res) => {
    try {
        let pool = await getConnection(); // Abre conexión cada vez
        await pool.request()
            .input('id', mssql.Int, req.body.id)
            .input('estado', mssql.VarChar, req.body.estado)
            .query("UPDATE Carga SET Estado = @estado WHERE ID = @id");

        res.json({ success: true });
    } catch (err) {
        console.error("Error actualizando estado:", err);
        res.status(500).send(err.message);
    }
});










// --- MANEJO GLOBAL DE ERRORES ---
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ success: false, message: "Error interno del servidor", error: err.message });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));