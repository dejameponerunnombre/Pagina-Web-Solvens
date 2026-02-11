import express from 'express';
import cors from 'cors';
import { getConnection, mssql } from './conexion.mjs';

const app = express();
app.use(express.json());
app.use(cors()); // Esto evita errores de bloqueo en el navegador

app.post('/login', async (req, res) => {
    const { user, password } = req.body;
    try {
        const pool = await getConnection();
        // Usamos parámetros para evitar inyecciones SQL
        const result = await pool.request()
            .input('usuario', mssql.VarChar, user)
            .input('clave', mssql.VarChar, password)
            .query('SELECT Usuario, Nombre, ID_Tipo_Usuario as tipo FROM Usuario WHERE Usuario = @usuario AND Clave = @clave');

        if (result.recordset.length > 0) {
            const datosUsuario = result.recordset[0];
            res.json({ 
                success: true, 
                message: "Bienvenido",
                tipo: datosUsuario.tipo, // Enviamos el tipo al frontend
                nombre: datosUsuario.Nombre,
            });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

app.listen(3000, () => console.log("Servidor backend en puerto 3000"));