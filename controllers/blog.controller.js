import { v4 as uuidv4 } from 'uuid';
import {
    validarPublicacion
} from '../schemas/blog.schema.js'
import {
    mostrarPublicacionesDB,
    buscarPublicacionDB,
    crearPublicacionDB,
    editarPublicacionDB,
    borrarPublicacionDB
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

    const { success, error, data: safeData } = validarPublicacion(data)
        if (!success) {
            return res.status(400).json({
                exito: false,
                mensaje: error.issues[0].message
            })
        }

    const datos = await crearPublicacionDB(publicacion_id, usuario_id, safeData.titulo, safeData.contenido)
    res.status(200).json({exito: true, message: "Publicacion creada exitosamente"})
}


export const mostrarPublicacion = async (req, res) => {
    const {id} = req.params

    const resultado = await buscarPublicacionDB(id)
    if (resultado === undefined) {
        return res.status(400).json({
            exito: false, 
            mensaje: "No se ha encontrado la publicacion"
        })
    }
    delete resultado.usuario_id
    res.status(200).json(resultado)
}

export const editarPublicacion = async (req, res) => {
    const {id} = req.params
    const data = req.body

    const existePublicacion = await buscarPublicacionDB(id)
    if (existePublicacion === undefined) {
        return res.status(400).json({exito: false, message: "No se pudo encontrar la publicacion"})
    }

    const { success, error, data: safeData } = validarPublicacion(data)
        if (!success) {
            return res.status(400).json({
                exito: false,
                mensaje: error.issues[0].message
            })
        }

    if (existePublicacion.usuario_id != req.params.usuario_id) {
        return res.status(401).json({exito: false, message: "No tiene permisos para editar esta publicacion"})
    }
    
    const resultado = await editarPublicacionDB(id, safeData.titulo, safeData.contenido)

    res.status(200).json({exito: true, message: "Publicacion editada exitosamente"})
}

export const borrarPublicacion = async (req, res) => {
    const {id} = req.params

    const existePublicacion = await buscarPublicacionDB(id)
    if (existePublicacion === undefined) {
        return res.status(400).json({exito: false, message: "No se pudo encontrar la publicacion"})
    }

    if (existePublicacion.usuario_id != req.params.usuario_id) {
        return res.status(401).json({exito: false, message: "No tiene permisos para borrar esta publicacion"})
    }
    
    const resultado = await borrarPublicacionDB(id)
    res.status(200).json({exito: true, message: "Publicacion borrada exitosamente"})
}