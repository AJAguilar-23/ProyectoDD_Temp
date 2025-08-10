import pool from '../config/db.js'

export const registrarUsuarioDB = async(usuario_id, nombre, correo, contrasena) => {
    const query = "INSERT INTO usuarios (usuario_id, nombre, correo, contrasena_hash) VALUES (UUID_TO_BIN(?), ?, ?, ?)";
    const [results] = await pool.query(query, [usuario_id, nombre, correo, contrasena])
    return results
}