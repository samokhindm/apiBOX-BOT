const TelegramAPI = require('node-telegram-bot-api')
const token = '5025502341:AAGoX0KUibgiwOZ2nrnaTpxwAfeBI1So8SM'
const bot = new TelegramAPI(token, {polling: true})
const chats = {}
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать');
    const randomNumber = Math.floor(Math.random()*10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    }catch (e) {
        console.log('Подключение к бд сломалось', e)
    }
    bot.setMyCommands([
        {command: '/start', description: 'Начало'},
        {command: '/info', description: 'Информация о пользователе'},
        {command: '/game', description: 'Начать игру'},
    ])

    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        try {
            if (text === '/start') {
                await UserModel.create({chatId});
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/5.webp');
                return bot.sendMessage(chatId, 'Привет! Это ты Слав?');
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name} правильных ответов ${user.right}, неправильных ${user.wrong}`);
            } 
            if (text === '/game') {
                return startGame(chatId);
            } 
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!')
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