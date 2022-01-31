module.exports = {
    replyOptions: {
        reply_markup: JSON.stringify({
            force_reply: true,
            //input_field_placeholder: 'test'
        })
    },

    projectSettingsOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Изменить название', callback_data: '/chengeProjectName'}],
                [{text: 'Обновить API KEY', callback_data: '/newAPIkey'}],
                [{text: 'Изменть ссылку', callback_data: '/newGSS'}]
                
            ]
        })
    },
    
    projectOptions: {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Добавить проект', callback_data: '/newPriject'}],
                [{text: 'Настроить', callback_data: '/prijectSettings'}],
                [{text: 'Удалить', callback_data: '/deleteProject'}]
            ]
            
        })
    },
    sellectProjectOptions: {

        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Добавить проект', callback_data: '/newPriject'}],
                [{text: 'Настроить', callback_data: '/prijectSettings'}],
                [{text: 'Удалить', callback_data: '/deleteProject'}]
            ]
            
        })
    }
}