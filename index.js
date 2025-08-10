import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'; // Rutas para autenticación [3, 6, 7]
import publicacionesRoutes from './routes/publicacionesroutes.js'; // Rutas para publicaciones [7, 8]


const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000


console.log('Hello, World!');


// Middlewares globales
// Permite a Express parsear el cuerpo de las peticiones en formato JSON [4]
app.use(express.json());

// Configuración de CORS para permitir solicitudes desde orígenes específicos [4]
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        // Puedes añadir otros orígenes permitidos aquí, como los de producción/test
        'https://prod.server.com',
        'https://test.server.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos [4]
    allowedHeaders: ['Content-Type', 'Authorization', 'Bearer', 'api-key'] // Encabezados permitidos [4]
}));

// Definición de las rutas de tu API

// Rutas de autenticación
// Se utilizará el prefijo '/api/auth' para todas las rutas de autenticación [6, 7]
app.use('/api/auth', authRoutes);

// Rutas de publicaciones
// Se utilizará el prefijo '/api/publicaciones' para todas las rutas relacionadas con publicaciones [7, 8]
app.use('/api/publicaciones', publicacionesRoutes);


// Si comentariosRoutes se manejaran de forma independiente a publicacionesRoutes y tuvieran un prefijo base diferente:
// app.use('/api/comentarios', comentariosRoutes);
// Nota: Según los requisitos, los comentarios están anidados bajo publicaciones,
// por lo que es probable que se manejen dentro del módulo de rutas de publicaciones
// o con una ruta como `/api/publicaciones/:id/comentarios` que ya sería capturada por `publicacionesRoutes`.

// Middleware para manejar rutas no encontradas (404)
// Este middleware se ejecuta si ninguna de las rutas anteriores hace "match" [10]
app.use((req, res) => {
    res.status(404).json({
        message: `${req.url} no encontrada`
    });
});

// Middleware centralizado para el manejo de errores [1, 11]
// Este es un ejemplo básico. Un manejo de errores más robusto podría incluir
// el registro de errores y mensajes más detallados para el desarrollador.
app.use((err, req, res, next) => {
    console.error(err.stack); // Muestra el stack del error en la consola del servidor
    res.status(err.statusCode || 500).json({
        message: err.message || 'Error interno del servidor'
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto http://localhost:${PORT}`); // [12]
});