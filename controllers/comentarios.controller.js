import { v4 as uuidv4 } from 'uuid';
import { buscarPublicacionDB } from "../models/publicaciones.model.js"
import { crearComentarioDB, mostrarComentariosDB } from '../models/comentarios.model.js';
import { validarComentario } from '../schemas/comentarios.schema.js';

export const mostrarComentarios = async (req, res) => {
    const {id} = req.params

    const existePublicacion = await buscarPublicacionDB(id)
        if (existePublicacion === undefined) {
            return res.status(400).json({
                exito: false, 
                mensaje: "No se ha encontrado la publicacion"
            })
        }

    const resultado = await mostrarComentariosDB(id)
    res.status(200).json(resultado)
}

export const crearComentario = async(req, res) => {
    const {id: publicacion_id} = req.params
    const comentario_id = uuidv4()
    const usuario_id = req.params.usuario_id

    const data = req.body

    const existePublicacion = await buscarPublicacionDB(publicacion_id)
        if (existePublicacion === undefined) {
            return res.status(400).json({
                exito: false, 
                mensaje: "No se ha encontrado la publicacion"
            })
        }

    const { success, error, data: safeData } = validarComentario(data)
            if (!success) {
                return res.status(400).json({
                    exito: false,
                    mensaje: error.issues[0].message
                })
            }
    
    const resultado = await crearComentarioDB(comentario_id, publicacion_id, usuario_id, safeData.contenido)
    res.status(200).json({exito: true, message: "Comentario publicado exitosamente"})
}