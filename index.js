const TelegramAPI = require('node-telegram-bot-api')
const token = '5025502341:AAGoX0KUibgiwOZ2nrnaTpxwAfeBI1So8SM'
const bot = new TelegramAPI(token, {polling: true})
const chats = {}
const {gameOptions, againOptions} = require('./options')

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать');
    const randomNumber = Math.floor(Math.random()*10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начало'},
        {command: '/info', description: 'Информация о пользователе'},
        {command: '/game', description: 'Начать игру'},
    ])

    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/5.webp');
            return bot.sendMessage(chatId, 'Привет! Это ты Слав?');
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
        } 
        if (text === '/game') {
            return startGame(chatId);
        } 
        return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!')
    
    })
    bot.on('callback_query', msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data == '/again') {
            return startGame(chatId)
        }
        if (data == chats[chatId]) {
            return bot.sendMessage(chatId, `Greate! you wright! its ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `You wrong! its ${chats[chatId]}`, againOptions)
        }
        bot.sendMessage(chatId, `Ты выбрал цифру ${data}`)
    })

}

start ()