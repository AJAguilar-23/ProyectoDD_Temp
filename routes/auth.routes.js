import {Router} from 'express'
import {registrarUsuario} from '../controllers/auth.controller.js'

const authRouter = Router()

authRouter.post('/register', registrarUsuario)

export default authRouter