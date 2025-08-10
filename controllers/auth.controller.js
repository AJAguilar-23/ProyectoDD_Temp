import jwt from 'jsonwebtoken'; // Para generar y verificar tokens JWT [4, 5]
import bcrypt from 'bcrypt'; // Para encriptar y comparar contraseñas [4-6]
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos [7]
import { Resend } from 'resend'; // Para enviar correos electrónicos, como en el ejemplo [4]

// Importar las funciones del modelo de autenticación
import { loginUser, register, updatePassword } from '../models/auth.js'; // [4]

/**
 * @route POST /api/auth/register
 * @description Permite a un nuevo usuario registrarse.
 * @access Pública
 */
export const createUser = async (req, res) => {
    const { name, email, phone, role } = req.body;

    // Validar datos de entrada básicos
    if (!name || !email || !phone || !role) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos (name, email, phone, role) son requeridos para el registro.'
        });
    }

    const id = uuidv4(); // Generar un ID UUID para el nuevo usuario [7]
    // Generar una contraseña temporal predeterminada y hashearla
    // En un entorno de producción, esta debería ser una contraseña aleatoria generada y enviada al usuario.
    const tempPassword = '1234'; // Contraseña temporal, como en el ejemplo [7]
    const password_hash = await bcrypt.hash(tempPassword, 10); // Hashear la contraseña [6, 7]

    try {
        // Registrar el usuario en la base de datos
        await register({ id, name, email, phone, password_hash, role }); // [8]

        // TODO: Enviar correo electrónico con la contraseña temporal
        // Se asume que RESEND_API_KEY está configurado en .env [8]
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'noreply@yourdomain.com', // Cambiar a un dominio verificado
                to: email,
                subject: 'Creación de cuenta - Contraseña temporal',
                html: `
                    <p>Hola ${name},</p>
                    <p>Tu cuenta ha sido creada exitosamente. Tu contraseña temporal es: <strong>${tempPassword}</strong></p>
                    <p>Por favor, inicia sesión y cámbiala lo antes posible.</p>
                `,
            });
        } else {
            console.warn('RESEND_API_KEY no está configurado. No se envió correo de bienvenida.');
        }

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente. Se ha enviado una contraseña temporal a su correo electrónico.',
            data: { id, name, email, phone }
        });

    } catch (error) {
        console.error('Error al crear el usuario:', error);
        // Manejar errores de base de datos (ej. email duplicado)
        if (error.code === 'ER_DUP_ENTRY') { // Código de error de MySQL para entrada duplicada
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: 'El correo electrónico ya está registrado.'
            });
        }
        res.status(500).json({ // 500 Internal Server Error
            success: false,
            message: 'Error interno del servidor al crear el usuario.',
            error: error.message
        });
    }
};

/**
 * @route POST /api/auth/login
 * @description Permite a un usuario iniciar sesión y obtener un token JWT.
 * @access Pública
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'El correo electrónico y la contraseña son requeridos.'
        });
    }

    try {
        const userData = await loginUser(email); // Obtener usuario del modelo [4]

        if (!userData || userData.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos.'
            });
        }

        // `loginUser` retorna un array, tomamos el primer elemento si existe
        const user = userData;

        // Validar que la contraseña sea correcta comparando el hash [4, 6]
        if (!await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos.'
            });
        }

        // Validar si el usuario debe cambiar su contraseña (`must_change_password`) [9]
        if (user.must_change_password) {
            // Si debe cambiarla, se le da un token temporal de corta duración
            // Este token incluirá el hash de la contraseña actual para que `setPassword` pueda verificarla.
            const tokenTemporal = jwt.sign({
                id: user.id,
                password_hash: user.password_hash // Se incluye el hash para verificación en `setPassword` [5]
            }, process.env.JWT_SECRET, {
                expiresIn: '1h' // Token temporal expira en 1 hora [9]
            });

            return res.status(200).json({
                success: true,
                message: 'Debe cambiar su contraseña. Use el token temporal para el endpoint /api/auth/set-password.',
                data: {
                    token: tokenTemporal,
                    must_change_password: true
                }
            });
        }

        // Si la autenticación es exitosa y no necesita cambiar la contraseña
        const payload = {
            id: user.id,
            role: user.role, // Se incluye el rol para control de permisos futuros [7]
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            algorithm: 'HS256', // Algoritmo recomendado [7]
            expiresIn: '12h' // Token de sesión expira en 12 horas [7]
        });

        // Eliminar el hash de la contraseña del objeto de usuario antes de enviarlo en la respuesta [7]
        delete user.password_hash;
        delete user.must_change_password; // También eliminar esta bandera de la respuesta

        res.status(200).json({
            success: true,
            message: 'Usuario autenticado correctamente.',
            data: user,
            token
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al intentar iniciar sesión.',
            error: error.message
        });
    }
};

/**
 * @route PATCH /api/auth/set-password
 * @description Permite a un usuario autenticado cambiar su contraseña.
 * @access Privada (requiere token JWT temporal o de sesión)
 */
export const setPassword = async (req, res) => {
    // El token se extrae directamente en el controlador para este endpoint, como en el ejemplo [5]
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token de autorización no proporcionado o formato incorrecto.'
        });
    }
    const token = authHeader.split(' ')[6]; // El token es el segundo elemento después de 'Bearer' [5]

    const { old_password, new_password, confirm_password } = req.body;

    // Validar que las nuevas contraseñas coincidan [10]
    if (new_password !== confirm_password) {
        return res.status(400).json({
            success: false,
            message: 'Las nuevas contraseñas no coinciden.'
        });
    }
    // Validar que la nueva contraseña no esté vacía o cumpla con requisitos mínimos (ej. longitud)
    if (!new_password || new_password.length < 6) { // Ejemplo de validación
        return res.status(400).json({
            success: false,
            message: 'La nueva contraseña debe tener al menos 6 caracteres.'
        });
    }

    try {
        // Verificar el token para obtener el ID del usuario y el hash de la contraseña actual [5]
        // NOTA: El ejemplo asume que el `password_hash` está en el payload del token temporal.
        // Para un token de sesión normal, `req.user.id` vendría del middleware `verifyToken`,
        // y se necesitaría buscar el `password_hash` del usuario en la DB antes de comparar.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const currentPasswordHashFromToken = decoded.password_hash; // Solo si se usa token temporal con hash

        // Si el token no tiene el hash (ej. es un token de sesión normal), se obtiene de la DB
        let userDbData;
        if (!currentPasswordHashFromToken) {
            userDbData = await loginUser(userId); // Se podría adaptar loginUser o crear getUserById
            if (!userDbData || userDbData.length === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
            }
            userDbData = userDbData; // Obtener el primer resultado
        }

        const passwordToCompare = currentPasswordHashFromToken || userDbData.password_hash;

        // Validar que la `old_password` proporcionada coincida con la contraseña actual hasheada [5]
        if (!await bcrypt.compare(old_password, passwordToCompare)) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña anterior no es correcta.'
            });
        }

        // Hashear la nueva contraseña [10]
        const newPasswordHash = await bcrypt.hash(new_password, 10);

        // Actualizar la contraseña en la base de datos [10]
        await updatePassword(userId, newPasswordHash); // [11]

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente.'
        });

    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        // Manejar errores de token inválido o expirado [12]
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado. Debe iniciar sesión nuevamente para cambiar la contraseña.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al cambiar la contraseña.',
            error: error.message
        });
    }
};

