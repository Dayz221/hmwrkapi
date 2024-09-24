import TelegramBot from "node-telegram-bot-api"
import { TOKEN } from "./config"

const bot = new TelegramBot(TOKEN, {polling: true})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  await bot.sendMessage(chatId, msg.text)
})

export default bot