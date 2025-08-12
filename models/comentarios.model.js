import pool from '../config/db.js'

export const mostrarComentariosDB = async (id) => {

}

export const crearComentarioDB = async (comentario_id, publicacion_id, usuario_id, contenido) => {
    const query = "INSERT INTO comentarios (comentario_id, publicacion_id, usuario_id, contenido) VALUES (?, ?, UUID_TO_BIN(?), ?)"
    const [resultado] = await pool.query(query, [comentario_id, publicacion_id, usuario_id, contenido])
    return resultado
}