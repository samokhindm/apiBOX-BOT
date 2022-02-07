const {Project} = require('../models/models')
const ApiError = require('../error/ApiError')
//const { DATE } = require('sequelize/dist')


class projectController {

    async saveSettings(req, res) {
        const {id, project_name, settings, gss_id, gds_id, valid_to} = req.body
        const project = await Project.findOne({
            where:{id: id}
        })
        project.project_name = project_name
        project.settings = settings
        project.gss_id = gss_id
        project.gds_id = gds_id
        project.valid_to = valid_to

        await project.save()
        return res.json(project)
    }

    async getAll(req, res) {
        const {} = req.body
        const projects = await Project.findAll({
        })
        return res.json(projects)
    }

    async getSettings(req, res) {
        const {gss_id} = req.params
        const today = new Date()
        const project = await Project.findOne({
            where: {gss_id: gss_id}
        })
        if (project.valid_to < today) {
            return res.json({message: 'Ошибка даты'})
        } 
        return res.json(project)
    }
    
    async deletProject(req, res) {
        const {id} = req.params
        await Project.destroy({
            where: {id: id}
        })
        return res.json({message: `Проект ID:${id} удален`})
    }
}

module.exports = new projectController()