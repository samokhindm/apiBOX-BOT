const Router = require('express')
const router = new Router()

const projectRouter = require('./projectRouter')

router.use('/project', projectRouter)

module.exports = router