import zod from 'zod'

const PublicacionSchema = zod.object({
    "titulo": zod.string({error: "El titulo es obligatorio"})
    .min(1, {error: "El titulo no puede estar vacio"})
    .max(30, {error: "El titulo no puede ser mayor de 30 caracteres"}),
    "contenido": zod.string({error: "El contenido es obligatorio"})
    .min(1, {error: "El contenido no puede estar vacio"})
    .max(100, {error: "El contenido no puede ser mayor de 100 caracteres"}),
})

export const validarPublicacion = (data) => {
    return PublicacionSchema.safeParse(data)
}