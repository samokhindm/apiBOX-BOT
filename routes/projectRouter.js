const Router = require('express')
const router = new Router()
const projectController = require('../controllers/projectController')


router.get('/', projectController.getAll)
//router.get('/:id', projectController.settings)

module.exports = router