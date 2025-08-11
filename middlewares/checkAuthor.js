import pool from '../config/db.js'; // Necesario para consultar la base de datos
// Podrías importar un modelo de Publicaciones si prefieres abstraer la consulta SQL.
// import { getPublicacionById } from '../models/publicaciones.js';

export const checkAuthor = async (req, res, next) => {
    // 1. Obtener el ID de la publicación de los parámetros de la ruta
    const publicacionId = req.params.id; // El ID de la publicación viene en la URL [5, 15, 16]

    // 2. Obtener el ID del usuario del token (adjuntado por `verifyToken` en `req.user`)
    const userIdFromToken = req.user.id; // Asume que `verifyToken` adjuntó el ID del usuario a `req.user.id`

    if (!publicacionId || !userIdFromToken) {
        return res.status(400).json({
            success: false,
            message: 'ID de publicación o ID de usuario no disponible para la verificación de autoría.'
        });
    }

    try {
        // 3. Consultar la base de datos para obtener el author_id de la publicación [2]
        const query = `SELECT BIN_TO_UUID(author_id) as author_id
                       FROM publicaciones
                       WHERE id = UUID_TO_BIN(?)`;
        const [results] = await pool.query(query, [publicacionId]);

        // 4. Verificar si la publicación existe
        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada.'
            });
        }

        const authorIdFromDb = results[0].author_id;

        // 5. Comparar el ID del usuario del token con el author_id de la publicación [2]
        if (userIdFromToken === authorIdFromDb) {
            // Si coinciden, el usuario es el autor, se permite continuar
            next();
        } else {
            // Si no coinciden, denegar el acceso [2]
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo el autor puede editar o eliminar esta publicación.'
            });
        }
    } catch (error) {
        console.error('Error al verificar la autoría:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al verificar la autoría.'
        });
    }
};