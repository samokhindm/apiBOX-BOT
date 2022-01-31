const Router = require('express')
const router = new Router()
const projectController = require('../controllers/projectController')
const checkRole = require('../middleware/checkRoleMidleware')

router.post('/save', checkRole('ADMIN'), projectController.saveSettings)
router.get('/getall', checkRole('ADMIN'), projectController.getAll)
router.get('/:gss_id', projectController.getSettings)
router.del('/:id', checkRole('ADMIN'), projectController.deletProject)

module.exports = router