import TelegramBot from "node-telegram-bot-api";
const token = "6988278127:AAF7LLkaCIwx66b6UCBVsJumXqZ8OtoVddU";
const webAppUrl = "https://test-telegram-web-app.netlify.app";
const express = require("express");
const cors = require("cors");
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text == "/start") {
        await bot.sendMessage(chatId, "Ниже появится кнопка, заполни форму", {
            reply_markup: {
                keyboard: [[{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }]],
            },
        });
    }

    if (msg.text == "/start") {
        await bot.sendMessage(chatId, "Заходи в наш интернет магазин", {
            reply_markup: {
                inline_keyboard: [[{ text: "Сделать заказ", web_app: { url: webAppUrl } }]],
            },
        });
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            await bot.sendMessage(chatId, "Спасибо за заказ");
            await bot.sendMessage(
                chatId,
                `Страна: ${data.country}\nГород: ${data.city}\nЛицо: ${data.subject}`,
            );

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Всю информацию о заказе вы получите здесь");
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});

app.post("/web-data", async (req: any, res: any) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Покупка успешно совершена!",
            input_message_content: {
                message_text: `Поздравляем с покупкой, вы приобрели товар на сумму: ${totalPrice}. Ваш заказ: ${products.map((item: any) => item.title)}`,
            },
        });
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Не удалось приобрести товар",
            input_message_content: {
                message_text: `Попробуйте позже`,
            },
        });
        return res.status(500).json({});
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`server started on port: ${PORT}`));
