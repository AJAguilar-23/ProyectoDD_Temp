import {Router} from 'express'
import {
    crearPublicacion,
    mostrarPublicaciones,
    mostrarPublicacion
} from '../controllers/blog.controller.js'
import {isAuth} from '../middlewares/isAuth.js'

const blogRouter = Router()

blogRouter.post('/', isAuth, crearPublicacion)
blogRouter.get('/', mostrarPublicaciones)
blogRouter.get('/:id', mostrarPublicacion)

export default blogRouter