import TelegramBot from "node-telegram-bot-api"

const token = '7418386580:AAGfabRzlGwRS7nbj4w7ISZrSgQouzD7Msg'
const bot = new TelegramBot(token, {polling: true})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  await bot.sendMessage(chatId, msg.text)
})

export default bot