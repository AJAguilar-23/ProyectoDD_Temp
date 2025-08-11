import pool from '../config/db.js'

export const crearPublicacionDB = async(publicacion_id, usuario_id, titulo, contenido) => {
    const query = "INSERT INTO publicaciones (publicacion_id, usuario_id, titulo, contenido) VALUES (?, UUID_TO_BIN(?), ?, ?)"
    const [resultado] = await pool.query(query, [publicacion_id, usuario_id, titulo, contenido])
    return resultado
}

export const mostrarPublicacionesDB = async(limite, offset) => {
    const query = `SELECT 
    titulo, contenido
    FROM publicaciones
    ORDER BY fecha_hora 
    LIMIT ? OFFSET ?`
    const [resultado] = await pool.query(query, [limite, offset])
    return resultado
}

export const mostrarPublicacionDB = async(id) => {
    const query = "SELECT titulo, contenido FROM publicaciones WHERE publicacion_id = ?"
    const [resultado] = await pool.query(query, [id])
    return resultado[0]
}