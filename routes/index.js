const Router = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const projectRouter = require('./projectRouter')

router.use('/project', projectRouter)
router.use('/user', userRouter)

module.exports = router