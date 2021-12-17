const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'tbot',
    'www',
    '140055',
    {
        host: '23.111.122.230',
        port: '5432',
        dialect: 'postgres'
    }
)