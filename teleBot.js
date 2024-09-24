import TelegramBot from "node-telegram-bot-api"

const bot = new TelegramBot(process.env.TOKEN, {polling: true})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  await bot.sendMessage(chatId, msg.text)
})

export default bot