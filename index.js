
require('dotenv').config()
const axios = require('axios').default;
const express = require('express')
const sequelize = require('./db')
const cors = require('cors')
const router = require('./routes/index')
const botController = require('./controllers/botController')
const errorHendler = require('./middleware/ErrorHendlingMiddleware')
const TelegramAPI = require('node-telegram-bot-api')
const token = process.env.TOKEN
const PORT = process.env.PORT || 5000
const bot = new TelegramAPI(token, {polling: true})
const {replyOptions, projectOptions, howItWorkOptions, showDemoOptions, onePleaseOptions, demoRegOptions, newUserOptions, projectSettingsOptions} = require('./options')
const {User, Project} = require('./models/models')
const { types } = require('pg')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

//Обработка ошибок, последний Middleware
app.use(errorHendler)

const newProjects = {}

function debug (odj = {}) {
    return JSON.stringify(odj, null, 4)
}
function getProjectId(source) {
    return source.substr(4, source.lenght)
}
function sendHTML(chatId, html) {
    const options = {
        projectOptions,
        parse_mode: 'HTML'
    }
    bot.sendMessage (chatId, html, options)
}
async function checkApiKey(apiKey) {
    const dateFrom = new Date().toISOString().slice(0,10)
    const url = `https://suppliers-stats.wildberries.ru/api/v1/supplier/orders?dateFrom=${dateFrom}&flag=0&key=${apiKey}`
    responseStatus = await axios.get(url).catch(function (error) {
        if (error.response) {
            return error.response.status;
        }
    });
    return responseStatus
}


async function supMassage (chatId, msg) {
    const supChatId = -736928533
    await bot.sendMessage (supChatId, `${chatId}`)
    return bot.forwardMessage (supChatId, chatId, msg.message_id)
}

async function sellectProject(chatId, method){
    const project = await Project.findAll({where:{
        chat_id: chatId.toString()
    }})
    const keyboard = []
    project.map((p, i) => {
        keyboard.push([{text: `${p.project_name} ${method} ${p.id}`, callback_data: `${method}${p.id}`}])
    })
    console.log(keyboard)
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    }
    return bot.sendMessage(chatId, 'Выбирете проект:', options)
}

async function projectList(chatId) {
    await bot.sendMessage(chatId, 'Ваши проекты:')
    Project.findAll({where:{
        chat_id: chatId.toString()
    }}).then(project => {
    const html = project.map((p, i) => {
        return `<b>${p.project_name}</b>  <a href='https://docs.google.com/spreadsheets/d/${p.gss_id}'> Таблица </a>, <a href='https://datastudio.google.com/reporting/${p.gds_id}'> Дашборд</a>`
        }).join('\n')
    return bot.sendMessage(chatId, html, projectOptions)
    })
}

async function deletProject(chatId, id) {
    await Project.destroy({where:{
        id: id
    }})
    return bot.sendMessage(chatId, `ID${id} удален`)
    
}

const newUser = async (chatId, email, firstName, lastName, username) => {
    await User.create ({
        chat_id: chatId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        username: username
    })
    return bot.sendMessage (chatId, `Спасибо ${firstName} . Вам нужно добавить проект.`, newUserOptions)
}

const newProject = async (chatId, newProjState) => {
    if (newProjState === 0) {
        return bot.sendMessage (chatId, 'Напишите название вашего магазина', replyOptions);
    }
    if (newProjState === 1) {
        return bot.sendMessage (chatId, 'Отлично! Сгенерируйте API ключ и отпрвьте его мне', replyOptions);
    }
    if (newProjState === 2) {
        await bot.sendMessage (chatId, 'Далее перейдите по ссылке и создайте копию документа к себе в аккаунт');
        return bot.sendMessage (chatId, 'Как все сделаете, отправьте мне ссылку на вашу копию', replyOptions);  
    }
    if (newProjState === 3) {
        await bot.sendMessage (chatId, 'Теперь можно настроить Дашборд. Создайте копию в свой аккаунт');
        return bot.sendMessage (chatId, 'Пришлите ссылку на Дашборд', replyOptions);
    }
    if (newProjState === 4) {
        try { 
        const user = await User.findOne ({where:{
            chat_id: chatId.toString()
            }
        })
        //await bot.sendMessage (chatId, `${user.id}`);
        const today = new Date()
        const project = await Project.create({
            userId: user.id,
            chat_id: chatId,
            project_name: newProjects.projectName,
            settings: newProjects.apiKey,
            gss_id: newProjects.gssId,
            gds_id: newProjects.gdsId,
            valid_to: today.setDate(today.getDate()+14)
            })
        return bot.sendMessage (chatId, `Круто! У вас новый проект: ${newProjects.projectName}`);
        } catch (e) {
            await bot.sendMessage (chatId, 'Не удалось создать проект')
            console.log ('Не удалось создать проект', e)
        }
        
    }
    
}
    
const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync(

        )
    } catch (e) {
        console.log('Подключение к бд сломалось', e)
    }
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    bot.setMyCommands([
        {command: '/start', description: 'Начать'},
        {command: '/info', description: 'Информация о проектах'},
        {command: '/help', description: 'Написать в поддержку'},
    ])

    
    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        const firstName = msg.from.first_name
        const lastName = msg.from.last_name
        const username = msg.from.username
        //const replyChatID = msg.reply_to_message.chat.id
        

    
        try {
            if (text === '/start') {
                //return bot.sendMessage (chatId, 'Привет! Я бот сервиса MPBox, помогу тебе сделать полезный отчет для твоего магазина на Wildberries', howItWorkOptions)
                //await bot.sendMessage (chatId, 'Привет! Я бот сервиса MPBox, помогу тебе разобраться в отчетах Wildberries и посчитать сколько вы заработали')
                try {
                    const user = await User.findOne({ where:{
                        chat_id: chatId.toString()
                        }
                    })
                    if (user === null) {
                        return bot.sendMessage (chatId, 'Привет! Я бот сервиса MPBox, помогу тебе сделать полезный отчет для твоего магазина на Wildberries', howItWorkOptions)
            //            await bot.sendMessage (chatId, `Вы не зарегистрированны. Нам понадобится ваша почта, что бы сообщать об обновлениях, не чаще одного раза в месяц. Обещаем спама не будет!`)
            //             return bot.sendMessage (chatId, 'Ваша почта:',replyOptions )
                        } else {
                        await bot.sendMessage (chatId, `Привет ${user.first_name}` )
                        const projs = await Project.findAll({ where:{
                            chat_id: chatId.toString()
                            }
                        })
                        if (projs[0] === undefined) {
                            return bot.sendMessage(chatId, 'У вас нет проектов', projectOptions)
                        } else {
                            
                            return projectList(chatId)

                            }
                    }
                    
                } catch (e) {
                    await bot.sendMessage (chatId, `${e}` )
                    }
            }
            if (text === '/info') {
                try {
                    const projs = await Project.findAll({ where:{
                        chat_id: chatId.toString()
                        }
                    })
                    if (projs[0] === undefined) {
                        
                        return bot.sendMessage(chatId, 'У вас нет проектов', projectOptions)
                      } else {
                        return projectList(chatId)
                      }
                } catch (e) {
                    await bot.sendMessage (chatId, `${e}` )
                }
                
            }

            if (text === '/help') {
                try {
                    const user = await User.findOne({ where:{
                        chat_id: chatId.toString()
                        }
                    })
                    if (user === undefined) {
                        return bot.sendMessage(chatId, 'Вы не зарегистрированы', projectOptions)
                    }
                    const projs = await Project.findAll({ where:{
                        chat_id: chatId.toString()
                        }
                    })
                    if (projs[0] === undefined) {
                        
                        return bot.sendMessage(chatId, 'У вас нет проектов', projectOptions)
                      } else {
                        return bot.sendMessage (chatId, `Напишите ваш вопрос ответом на это сообщение`,replyOptions)
                        //return helpMassage (chatId, user, projs)
                      }
                } catch (e) {
                    await bot.sendMessage (chatId, `${e}` )
                }
                
            }

            if (msg.reply_to_message.text === 'Напишите ваш вопрос ответом на это сообщение') {
                //await bot.sendMessage(chatId, `${msg.message_id}`)
                return supMassage(chatId, msg)
            }

            if (msg.reply_to_message.chat.id == '-736928533') {
                await bot.sendMessage(msg.reply_to_message.forward_from.id , `${msg.text}`)
                return bot.sendMessage (msg.reply_to_message.forward_from.id, `Напишите ваш вопрос ответом на это сообщение`,replyOptions)
            }
            

            if (msg.reply_to_message.text === 'Напишите название вашего магазина') {
                if (!text ) {
                    return newProject(chatId, 0);
                }
                newProjects.projectName = text
                return newProject(chatId, 1);
            }
            if (msg.reply_to_message.text === 'Отлично! Сгенерируйте API ключ и отпрвьте его мне') {
                if (!text || text.length != 48 ) {
                    await bot.sendMessage (chatId, `Неверный ключ`)
                    return newProject(chatId, 1);
                }
                await checkApiKey(text)
                if (responseStatus === 401) {
                    await bot.sendMessage (chatId, `checkApiKey: Неверный ключ`)
                    return newProject(chatId, 1);
                }
                newProjects.apiKey = text
                return newProject(chatId, 2);
            }
            if (msg.reply_to_message.text === 'Как все сделаете, отправьте мне ссылку на вашу копию') {
                if (!text) {
                    await bot.sendMessage (chatId, `Нам нужна именно ссылка`)
                    return newProject(chatId, 2);
                }
                const gssId = text.split('/')[5]
                newProjects.gssId = gssId
                return newProject(chatId, 3);
            }
            if (msg.reply_to_message.text === 'Пришлите ссылку на Дашборд') {
                if (!text) {
                    await bot.sendMessage (chatId, `Нам нужна именно ссылка`)
                    return newProject(chatId, 3);
                }
                const gdsId = text.split('/')[4]
                newProjects.gdsId = gdsId
                
                return newProject(chatId, 4);
            }
            // email reply for SIGNUP
            if (msg.reply_to_message.text === 'Ваша почта:') {
                email = text
                return newUser(chatId, email, firstName, lastName, username);
            }

            return bot.sendMessage(chatId, debug(msg))
        } catch (e) {
            return bot.sendMessage(chatId, `Произошла какая то ошибка: ${e}`)
        }
    
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data == '/newPriject') {
            return newProject(chatId,0 )
        }
        
        if (data == '/deleteProject') {
            const metod = '/del'
            return sellectProject(chatId, metod)
        }
        
        if ( /\/del(.+)/.test(data)) {
            const id = getProjectId(data)
            //return bot.sendMessage(chatId, `${data}`)
            return deletProject(chatId, id)
        }

        if (data == '/howItWork') {
            return bot.sendMessage(chatId, `Мы забираем данные у WB через API, высчитываем нужные показатели и делаем удобные графики в Google Data Studio. Для формирования отчета нам нужен API ключ продавца и информация по себестоимости товара.`, showDemoOptions)
            
        }

        if (data == '/showDemo') {
            return bot.sendMessage(chatId, `Лови ссылку на <a href='https://datastudio.google.com/u/0/reporting/407d0773-da27-464d-94ae-154fc3a7b5d4/'> демо-очет </a> и <a href='https://www.youtube.com/'> видео-презентацию</a>.`, onePleaseOptions)
        }

        if (data == '/help') {
            return bot.sendMessage (chatId, `Напишите ваш вопрос ответом на это сообщение`,replyOptions)
        }

        if (data == '/onePlease') {
            return bot.sendMessage(chatId, `Доступ стоит всего 990 рублей в месяц и дается бесплатный доступ на 7 дней, чтобы ты мог оценить пользу от отчета.`, demoRegOptions)
        }

        if (data == '/wonaDemo') {
            await bot.sendMessage (chatId, `Нам понадобится ваша почта, что бы сообщать об обновлениях, не чаще одного раза в месяц. Обещаем спама не будет!`)
            return bot.sendMessage (chatId, 'Ваша почта:',replyOptions )
        }
        
    })

}

start ()