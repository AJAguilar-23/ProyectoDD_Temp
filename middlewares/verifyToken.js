import jwt from 'jsonwebtoken'; // Importar JWT para verificar el token [6]

// Asumiendo que JWT_SECRET está definido en tus variables de entorno (.env)
// dotenv se carga en server.js o index.js [7]

export const verifyToken = (req, res, next) => {
    // 1. Obtener el encabezado de autorización [6]
    const { authorization } = req.headers;

    // 2. Verificar si el encabezado de autorización existe [6]
    if (!authorization) {
        return res.status(401).json({
            success: false,
            message: 'Debe iniciar sesión para acceder a este recurso. No se proporcionó token.'
        });
    }

    // 3. Extraer el token (formato "Bearer TOKEN") [6]
    const token = authorization.split(' ')[3];

    // 4. Validar y verificar el token JWT [6]
    try {
        // jwt.verify decodifica el token usando la clave secreta
        // y lanza un error si el token es inválido o ha expirado.
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // `process.env.JWT_SECRET` es crucial [6]

        // Adjuntar el ID del usuario autenticado (y otros datos como el rol si es necesario)
        // al objeto `req` para que esté disponible en los controladores subsiguientes.
        // El ejemplo `isAuth.js.ejemplo.txt` usa `req.params.id` y `req.params.role` [6, 8].
        // Sin embargo, una práctica común y más limpia es adjuntarlo a `req.user` o `req.auth`.
        req.user = decoded; // Contendrá { id: '...', role: '...' } si se incluyó en el payload del token.

        // 5. Continuar con la siguiente función de middleware o controlador [8]
        next();
    } catch (error) {
        // Manejo de errores para tokens inválidos o expirados [8]
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado. Debe iniciar sesión nuevamente.'
        });
    }
};
