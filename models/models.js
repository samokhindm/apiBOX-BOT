const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Project = sequelize.define('projects', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    app: {type: DataTypes.STRING, defaultValue: 'WB'},
    chat_id: {type: DataTypes.STRING, unique: true},
    project_name: {type:DataTypes.STRING},
    settings: {type: DataTypes.STRING, unique: true},
    gss_id: {type: DataTypes.STRING, unique: true},
    gds_id: {type: DataTypes.STRING, unique: true},
    valid_to: {type:DataTypes.DATE},
})

module.exports = Project