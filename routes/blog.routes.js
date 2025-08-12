import {Router} from 'express'
import {
    crearPublicacion,
    mostrarPublicaciones,
    mostrarPublicacion,
    editarPublicacion,
    borrarPublicacion
} from '../controllers/blog.controller.js'
import {isAuth} from '../middlewares/isAuth.js'

const blogRouter = Router()

blogRouter.post('/', isAuth, crearPublicacion)
blogRouter.get('/', mostrarPublicaciones)
blogRouter.get('/:id', mostrarPublicacion)
blogRouter.put('/:id', isAuth, editarPublicacion)
blogRouter.delete('/:id', isAuth, borrarPublicacion)

export default blogRouter