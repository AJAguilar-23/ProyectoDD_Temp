import {Router} from 'express'
import {
    crearPublicacion,
    mostrarPublicaciones
} from '../controllers/blog.controller.js'
import {isAuth} from '../middlewares/isAuth.js'

const blogRouter = Router()

blogRouter.post('/', isAuth, crearPublicacion)
blogRouter.get('/', mostrarPublicaciones)

export default blogRouter