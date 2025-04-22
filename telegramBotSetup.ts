import { Bot } from "npm:grammy";

const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN")!);

bot.on("message:text", (ctx) => ctx.reply("Chat ID: " + ctx.message.chat.id));
bot.start();
