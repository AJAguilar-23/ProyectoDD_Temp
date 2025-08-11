import {Router} from 'express'
import {crearPublicacion} from '../controllers/blog.controller.js'
import {isAuth} from '../middlewares/isAuth.js'

const blogRouter = Router()

blogRouter.post('/', isAuth, crearPublicacion)

export default blogRouter