import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import {validarRegistro} from '../schemas/auth.schema.js'

import {registrarUsuarioDB} from '../models/auth.model.js'

export const registrarUsuario = async(req, res) => {
    const usuario_id = uuidv4()
    const data = req.body

    const { success, error, data: safeData } = validarRegistro(data)
    

    if (!success) {
        return res.status(400).json({
            mensaje: error.issues[0].message
        })
    }
   
    const {nombre, correo, contrasena} = safeData
    const resultado = await registrarUsuarioDB(usuario_id, nombre, correo, contrasena)
    console.log(safeData)
}