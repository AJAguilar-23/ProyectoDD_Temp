import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos [13]
// Importar las funciones del modelo de publicaciones
import {
    getAllPublicaciones,
    getPublicacionById,
    createPublicacion,
    updatePublicacion,
    deletePublicacion
} from '../models/publicaciones.js'; // [14]

/**
 * @route GET /api/publicaciones
 * @description Lista todas las publicaciones con paginación.
 * @access Pública
 */
export const getAllPublic = async (req, res) => {
    // Obtener parámetros de paginación de la consulta (query) [15]
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; // Calcular el offset para la consulta SQL

    try {
        const publicaciones = await getAllPublicaciones({ limit, offset }); // [16]

        // Si la consulta es exitosa, devuelve las publicaciones
        res.status(200).json({
            success: true,
            message: 'Publicaciones obtenidas correctamente.',
            data: publicaciones,
            pagination: {
                page,
                limit,
                // Puedes añadir un 'total' de publicaciones si se implementa un COUNT(*) en el modelo
            }
        });
    } catch (error) {
        console.error('Error al obtener todas las publicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener las publicaciones.',
            error: error.message
        });
    }
};

/**
 * @route GET /api/publicaciones/:id
 * @description Obtiene una publicación específica por su ID.
 * @access Pública
 */
export const getById = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la publicación de los parámetros de la ruta [15]
/*
    if (!uuidv4.validate(id)) { // Validación básica de formato UUID
        return res.status(400).json({
            success: false,
            message: 'ID de publicación inválido.'
        });
    }
*/
    try {
        const publicacion = await getPublicacionById(id); // [17]

        if (!publicacion || publicacion.length === 0) { // Si la publicación no se encuentra
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Publicación obtenida correctamente.',
            data: publicacion // getPublicacionById devuelve un array, tomamos el primer elemento [18]
        });
    } catch (error) {
        console.error('Error al obtener la publicación por ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener la publicación.',
            error: error.message
        });
    }
};

/**
 * @route POST /api/publicaciones
 * @description Crea una nueva publicación.
 * @access Privada (solo usuario autenticado)
 */
export const createPublic = async (req, res) => {
    const { titulo, contenido, imagen_url } = req.body; // Campos del cuerpo de la solicitud [19]
    const author_id = req.user.id; // El ID del autor se obtiene del token JWT verificado por verifyToken [20, 21]

    // Validar datos de entrada [1, 3]
    if (!titulo || !contenido) {
        return res.status(400).json({
            success: false,
            message: 'El título y el contenido son campos requeridos para crear una publicación.'
        });
    }

    const id = uuidv4(); // Generar un ID UUID para la nueva publicación [13]

    try {
        const nuevaPublicacion = {
            id,
            title: titulo,
            content: contenido,
            author_id,
            imagen_url: imagen_url || null // `imagen_url` es opcional
        };
        await createPublicacion(nuevaPublicacion); // [13]

        res.status(201).json({ // 201 Created para recursos creados exitosamente [2]
            success: true,
            message: 'Publicación creada exitosamente.',
            data: nuevaPublicacion
        });
    } catch (error) {
        console.error('Error al crear la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear la publicación.',
            error: error.message
        });
    }
};

/**
 * @route PUT /api/publicaciones/:id
 * @description Edita una publicación existente (solo el autor).
 * @access Privada (requiere autenticación y verificación de autoría)
 */
export const updatePublic = async (req, res) => {
    const { id } = req.params; // ID de la publicación a actualizar [22, 23]
    const { titulo, contenido, imagen_url } = req.body; // Nuevos datos de la publicación
    const author_id = req.user.id; // ID del usuario autenticado [20, 24]

    // Validar datos de entrada
    if (!titulo && !contenido && !imagen_url) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere al menos un campo (titulo, contenido o imagen_url) para actualizar la publicación.'
        });
    }/*
    if (!uuidv4.validate(id)) { // Validación de formato UUID
        return res.status(400).json({
            success: false,
            message: 'ID de publicación inválido.'
        });
    }*/

    try {
        // `checkAuthor` middleware ya verificó que `req.user.id` es el `author_id` de la publicación [24, 25]
        // Se puede obtener la publicación para verificar su existencia antes de intentar actualizar
        const existingPublicacion = await getPublicacionById(id);
        if (!existingPublicacion || existingPublicacion.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada.'
            });
        }

        const updates = {
            title: titulo || existingPublicacion.title, // Mantener el título actual si no se provee uno nuevo
            content: contenido || existingPublicacion.content, // Mantener el contenido actual si no se provee uno nuevo
            imagen_url: imagen_url !== undefined ? imagen_url : existingPublicacion.imagen_url // Permite setear a null si se envía explicitamente
        };

        const result = await updatePublicacion(id, updates, author_id); // [26]

        if (result.affectedRows === 0) {
            // Esto solo debería ocurrir si la publicación desaparece entre la verificación y la actualización
            // o si el autor no coincide (lo cual ya sería manejado por checkAuthor antes)
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar la publicación. Puede que no exista o no sea el autor.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Publicación actualizada exitosamente.',
            data: { id, ...updates } // Retorna los datos actualizados
        });
    } catch (error) {
        console.error('Error al actualizar la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la publicación.',
            error: error.message
        });
    }
};

/**
 * @route DELETE /api/publicaciones/:id
 * @description Elimina una publicación (solo el autor).
 * @access Privada (requiere autenticación y verificación de autoría)
 */
export const deletePublic = async (req, res) => {
    const { id } = req.params; // ID de la publicación a eliminar [22, 27]
    const author_id = req.user.id; // ID del usuario autenticado [20, 24]
/*
    if (!uuidv4.validate(id)) { // Validación de formato UUID
        return res.status(400).json({
            success: false,
            message: 'ID de publicación inválido.'
        });
    }
*/
    try {
        // `checkAuthor` middleware ya verificó que `req.user.id` es el `author_id` de la publicación [24, 25]
        const result = await deletePublicacion(id, author_id); // [28]

        if (result.affectedRows === 0) {
            // Esto podría indicar que la publicación no existe o el autor no coincide (aunque `checkAuthor` lo evitaría)
            return res.status(404).json({
                success: false,
                message: 'No se pudo eliminar la publicación. Puede que no exista o no sea el autor.'
            });
        }

        res.status(204).send(); // 204 No Content para eliminación exitosa sin contenido para devolver [2]
    } catch (error) {
        console.error('Error al eliminar la publicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar la publicación.',
            error: error.message
        });
    }
};

