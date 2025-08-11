import zod from 'zod'

const registroSchema = zod.object({
    "nombre": zod.string({error: "El nombre de usuario es obligatorio"})
    .min(3, {error: "El nombre de usuario debe tener 3 o mas caracteres"})
    .max(100, {error: "La cantidad maxima de caracteres es de 100"}),

    "correo": zod.email({error: "El correo no es valido"})
    .max(100, {error: "El correo no puede exceder 100 caracteres"}),
    "contrasena": zod.string({error: "La contraseña es obligatoria"})
})

export const validarRegistro = (usuario) => {
    return registroSchema.safeParse(usuario)
}

const loginSchema = zod.object({
    "correo": zod.email({error: "El correo no es valido"})
    .max(100, {error: "El correo no puede exceder 100 caracteres"}),
    "contrasena": zod.string({error: "La contraseña es obligatoria"})
    })

export const validarLogin = (usuario) => {
    return loginSchema.safeParse(usuario)
}