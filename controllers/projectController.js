const ProjectModel = require('../models/models')
const ApiError = require('../error/ApiError')


class ProjectController {

    async getAll (req, res) {
        
        const projects = await ProjectModel.findAll()
        return res.json(projects)
    }

    async settings (req, res) {
        
        res.json({message:'ALL WORKING'})
    }
    
}

module.exports = new ProjectController()