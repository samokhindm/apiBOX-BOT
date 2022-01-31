const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('users', {
    id: {type: DataTypes.INTEGER, primaryKey:true, autoIncrement: true},
    chat_id: {type: DataTypes.STRING, unique:true},
    email: {type: DataTypes.STRING, unique:true},
    password: {type: DataTypes.STRING},
    first_name: {type: DataTypes.STRING},
    last_name: {type: DataTypes.STRING},
    username: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"}
})

const Project = sequelize.define('projects', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    app: {type: DataTypes.STRING, defaultValue: 'WB'},
    chat_id: {type: DataTypes.STRING},
    project_name: {type:DataTypes.STRING},
    settings: {type: DataTypes.STRING, unique: true},
    gss_id: {type: DataTypes.STRING, unique: true},
    gds_id: {type: DataTypes.STRING, unique: true},
    valid_to: {type:DataTypes.DATE},
})

User.hasMany(Project)
Project.belongsTo(User)

module.exports = {
    User,
    Project
}