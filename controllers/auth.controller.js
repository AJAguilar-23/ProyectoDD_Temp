import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import {validarRegistro, validarLogin} from '../schemas/auth.schema.js'

import {registrarUsuarioDB, loginUsuarioDB} from '../models/auth.model.js'

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

export const loginUsuario = async (req, res) => {
    const data = req.body

    const { success, error, data: safeData } = validarLogin(data)

    if (!success) {
        return res.status(400).json({
            exito: false,
            mensaje: error.issues[0].message
        })
    }

    const {correo, contrasena} = safeData
    const resultado = await loginUsuarioDB(correo)

    if (resultado === undefined) {
        return res.status(400).json({
            exito: false, 
            mensaje: "Correo o contraseña incorrectos"
        })
    }
    if (!await bcrypt.compare(contrasena, resultado.contrasena_hash)) {
        return res.status(400).json({
            exito: false,
            mensaje: 'Correo o contraseña incorrectos'
        })
    }

    const payload = {
        usuario_id: resultado.usuario_id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256', 
        expiresIn: '12h'
    })

    res.status(201).json({
        exito: true,
        mensaje: "Usuario autenticado con exito",
        token
    })
}