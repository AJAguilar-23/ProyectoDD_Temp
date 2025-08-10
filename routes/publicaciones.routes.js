import { Router } from 'express';
// Se importa verifyToken, que es el equivalente a isAuth del ejemplo de películas [20].
import { verifyToken } from '../middlewares/verifyToken.js'; // Middleware para proteger rutas privadas [8, 14]
// Se necesita un middleware para verificar que el usuario es el autor, similar a isAdmin [21].
// Lo llamaremos checkAuthor.
import { checkAuthor } from '../middlewares/checkAuthor.js'; // Middleware para verificar propiedad [5, 19]

// Importa tus controladores de publicaciones
import {
    getAllPublic,
    getById,
    createPublic,
    updatePublic,
    deletePublic
} from '../controllers/publicaciones.controller.js'; // Asume que tienes estos controladores

// Importa tus controladores de comentarios (pueden estar en un archivo separado o integrados)
import {
     getComent,
    createComent
} from '../controllers/comentarios.controller.js'; // O integrados en publicaciones.controller.js

const publicacionesRouter = Router();

// --- Endpoints de Publicaciones ---

// GET /api/publicaciones: Listar todas las publicaciones con paginación [4]
// Esta ruta es pública y no requiere protección.
publicacionesRouter.get('/', getAllPublic);

// GET /api/publicaciones/:id: Ver una publicación específica [4]
// Esta ruta es pública y no requiere protección.
publicacionesRouter.get('/:id', getById);

// POST /api/publicaciones: Crear una nueva publicación [5]
// Requiere que el usuario esté autenticado.
publicacionesRouter.post('/', verifyToken, createPublic); // [5]

// PUT /api/publicaciones/:id: Editar publicación (solo el autor) [5]
// Requiere autenticación y el middleware `checkAuthor` para verificar la propiedad.
publicacionesRouter.put('/:id', verifyToken, checkAuthor, updatePublic); // [5, 19]

// DELETE /api/publicaciones/:id: Eliminar publicación (solo el autor) [5]
// Requiere autenticación y el middleware `checkAuthor` para verificar la propiedad.
publicacionesRouter.delete('/:id', verifyToken, checkAuthor, deletePublic); // [5, 19]

// --- Endpoints de Comentarios (anidados bajo publicaciones) ---

// GET /api/publicaciones/:id/comentarios: Ver todos los comentarios de una publicación [5]
// Esta ruta es pública.
publicacionesRouter.get('/:id/comentarios',  getComent);

// POST /api/publicaciones/:id/comentarios: Comentar en una publicación [19]
// Requiere que el usuario esté autenticado.
publicacionesRouter.post('/:id/comentarios', verifyToken, createComent);

export default publicacionesRouter;