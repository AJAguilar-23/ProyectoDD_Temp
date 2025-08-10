import { Router } from 'express';
// Importa tus controladores de autenticación
// createUser es el controlador de registro, login es para iniciar sesión, y setPassword para cambiar la contraseña.
import { createUser, login, setPassword } from '../controllers/auth.controller.js'; // [11]

const authRouter = Router();

// POST /api/auth/register: Registro de usuario [4, 14]
authRouter.post('/register', createUser); // [11]
// El controlador `createUser` en `auth.controller.js.ejemplo.txt` maneja el registro [15].

// POST /api/auth/login: Inicio de sesión [4, 14]
authRouter.post('/login', login); // [11]
// El controlador `login` en `auth.controller.js.ejemplo.txt` maneja el inicio de sesión [16].

// PATCH /api/auth/set-password: Cambio de contraseña (opcional, pero incluido en el ejemplo de API.http [17])
// Este endpoint podría requerir autenticación para asegurar que solo el usuario logueado pueda cambiar su contraseña.
// Si `setPassword` en el controlador (auth.controller.js.ejemplo.txt [18]) ya maneja la verificación del token,
// entonces el middleware `verifyToken` podría ser redundante si el token ya se valida internamente en `setPassword`.
// Sin embargo, para mayor claridad y consistencia, se podría añadir.
// Ejemplo: authRouter.patch('/set-password', verifyToken, setPassword);
authRouter.patch('/set-password', setPassword); // [11]
// El controlador `setPassword` en `auth.controller.js.ejemplo.txt` maneja el cambio de contraseña [18].

export default authRouter;