require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const router = require('./routes/index')
const errorHendler = require('./middleware/ErrorHendlingMiddleware')
const TelegramAPI = require('node-telegram-bot-api')
const token = process.env.TOKEN
const PORT = process.env.PORT || 5000
const bot = new TelegramAPI(token, {polling: true})
const {newProjectOptions, againOptions} = require('./options')
//const models = require('./models/models')
const ProjectModel = require('./models/models')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api',router)

//Обработка ошибок, последний Middleware
app.use(errorHendler)

const newProjects = {}

function debug (odj = {}) {
    return JSON.stringify(odj, null, 4)
}

const newProject = async (chatId, newProjState) => {
    if (newProjState === 0) {
        return bot.sendMessage (chatId, 'Напишите название вашего магазина', newProjectOptions);
    }
    if (newProjState === 1) {
        return bot.sendMessage (chatId, 'Отлично! Сгенерируйте API ключ и отпрвьте его мне', newProjectOptions);
    }
    if (newProjState === 2) {
        await bot.sendMessage (chatId, 'Далее перейдите по ссылке и создайте копию документа к себе в аккаунт');
        return bot.sendMessage (chatId, 'Как все сделаете, отправьте мне ссылку на вашу копию', newProjectOptions);  
    }
    if (newProjState === 3) {
        await bot.sendMessage (chatId, 'Теперь можно настроить Дашборд. Создайте копию в свой аккаунт');
        return bot.sendMessage (chatId, 'Пришлите ссылку на Дашборд', newProjectOptions);
    }
    if (newProjState === 4) {

        try {   
        const project = await ProjectModel.create({
            chat_id: chatId,
            project_name: newProjects.projectName,
            settings: newProjects.apiKey,
            gss_id: newProjects.gssUrl,
            gds_id: newProjects.gdsUrl
            })
        
        }catch (e) {
            console.log('Не удалось создать запись', e)
        }
        await bot.sendMessage (chatId, `Круто! ${newProjects.projectName}, ${newProjects.apiKey}, ${newProjects.gssUrl}, ${newProjects.gdsUrl}`);
    }
    
}
    
const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    }catch (e) {
        console.log('Подключение к бд сломалось', e)
    }
    bot.setMyCommands([
        {command: '/start', description: 'Добавить проект'},
        {command: '/info', description: 'Информация о проектах'},
        {command: '/settings', description: 'Настроить проект'},
        {command: '/delete', description: 'Удалить проект'},
    ])

    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        try {
            if (text === '/start') {
                await bot.sendMessage (chatId, 'Этот бот поможет разобраться в отчетах ВБ и посчитать сколько вы заработали')
                return newProject(chatId, 0)
            }
            if (text === '/info') {
                const project = await ProjectModel.findAll({
                    chatId
                })
                
                return bot.sendMessage(chatId, JSON.stringify(project, null, 4))
            }
            if (msg.reply_to_message.text === 'Напишите название вашего магазина') {
                newProjects.projectName = text
                return newProject(chatId, 1);
            }
            if (msg.reply_to_message.text === 'Отлично! Сгенерируйте API ключ и отпрвьте его мне') {
                newProjects.apiKey = text
                return newProject(chatId, 2);
            }
            if (msg.reply_to_message.text === 'Как все сделаете, отправьте мне ссылку на вашу копию') {
                newProjects.gssUrl = text
                return newProject(chatId, 3);
            }
            if (msg.reply_to_message.text === 'Пришлите ссылку на Дашборд') {
                newProjects.gdsUrl = text
                return newProject(chatId, 4);
            }

            return bot.sendMessage(chatId, debug(msg))
        }catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка')
        }
    
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data == '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            user.right +=1
            await bot.sendMessage(chatId, `Greate! you wright! its ${chats[chatId]}`, againOptions)
        } else {
            user.wrong +=1
            await bot.sendMessage(chatId, `You wrong! its ${chats[chatId]}`, againOptions)
        }
        await user.save()
        
    })

}

start ()