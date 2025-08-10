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
            exito: false,
            mensaje: error.issues[0].message
        })
    }
   
    const {nombre, correo, contrasena} = safeData
    const contrasena_hash = await bcrypt.hash(contrasena, 12)


    try {
        const resultado = await registrarUsuarioDB(usuario_id, nombre, correo, contrasena_hash)
        res.status(201).json({exito: true, mensaje: "Usuario creado con exito"})
    }
    catch(error) {
        res.status(400).json({ exito: false, mensaje: error.message });
    }
}