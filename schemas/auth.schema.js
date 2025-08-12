import zod from 'zod'


const registroSchema = zod.object({
    "nombre": zod.string({error: "El nombre de usuario es obligatorio"})
    .refine((val) => {return /^[a-zA-Z0-9_.-]+$/.test(val)}, {error: "El nombre de usuario solo puede contener letras, números, guion bajo, punto y guion medio"})
    .min(3, {error: "El nombre de usuario debe tener 3 o mas caracteres"})
    .max(150, {error: "La cantidad maxima de caracteres es de 150"}),

    "correo": zod.email({error: "El correo no es valido"})
    .max(100, {error: "El correo no puede exceder 100 caracteres"}),
    "contrasena": zod.string({error: "La contraseña es obligatoria"})
    }).strict()

export const validarRegistro = (usuario) => {
    return registroSchema.safeParse(usuario)
}

const loginSchema = zod.object({
    "correo": zod.email({error: "El correo no es valido"})
    .max(100, {error: "El correo no puede exceder 100 caracteres"}),
    "contrasena": zod.string({error: "La contraseña es obligatoria"})
}).strict()

export const validarLogin = (usuario) => {
    return loginSchema.safeParse(usuario)
}