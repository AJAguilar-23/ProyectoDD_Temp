import { v4 as uuidv4 } from 'uuid';
import {
    validarCrearPublicacion
} from '../schemas/blog.schema.js'
import {
    mostrarPublicacionesDB,
    crearPublicacionDB
} from '../models/blog.model.js'


export const mostrarPublicaciones = async (req, res) => {
    const {pag} = req.query
    const limite = 5

    const offset = (pag - 1) * limite
    const datos = await mostrarPublicacionesDB(limite, offset)
    res.status(200).json(datos)
}

export const crearPublicacion = async (req, res) => {
    const data = req.body
    const usuario_id = req.params.usuario_id
    const publicacion_id = uuidv4()

    const { success, error, data: safeData } = validarCrearPublicacion(data)
        if (!success) {
            return res.status(400).json({
                exito: false,
                mensaje: error.issues[0].message
            })
        }

    const datos = await crearPublicacionDB(publicacion_id, usuario_id, safeData.titulo, safeData.contenido)
    res.status(200).json({exito: true, message: "Publicacion creada exitosamente"})
}