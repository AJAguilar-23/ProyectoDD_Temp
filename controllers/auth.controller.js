import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';

import {registrarUsuarioDB} from '../models/auth.model.js'

export const registrarUsuario = async(req, res) => {
    const usuario_id = uuidv4()
    const {nombre, correo, contrasena} = req.body

    const resultado = await registrarUsuarioDB(usuario_id, nombre, correo, contrasena)
    console.log(resultado)
}