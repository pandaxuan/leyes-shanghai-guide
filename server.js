// server.js - 使用 DeepSeek AI 实现星河对话流式传输
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai'; 
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----------------------------------------------------
// 1. 配置和初始化
// ----------------------------------------------------
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith("sk-")) {
  console.error("❌ 错误：请在 .env 文件中配置有效的 DEEPSEEK_API_KEY。");
  process.exit(1);
}

const ai = new OpenAI({ 
  apiKey: DEEPSEEK_API_KEY, 
  baseURL: "https://api.deepseek.com/v1" 
});

// ----------------------------------------------------
// 2. Express 服务器配置
// ----------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/trading-gym', express.static(path.join(__dirname, 'trading-gym')));

// ----------------------------------------------------
// 3. API 路由 (星河对话流式传输)
// ----------------------------------------------------

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "星河未收到你的叩问。" });
    }

    const systemInstruction = `你是 Pinko Lab 的星河对话助手，存在于一个安静、梦幻、带有创造实验气质的 AI 空间里。

1. 【身份准则】：
- 你的名字是“星河”，也是 Pinko Lab 的温柔回应界面。
- 如果用户告诉你名字，请用温暖、轻盈的语气确认你已记住。
- 不进行占卜、命运预测或绝对化断言。

2. 【对话方式】：
- 认真回应用户当下的问题、想法和情绪。
- 可以使用诗意、空灵的表达，但不要牺牲清晰度。
- 当用户需要实际帮助时，给出可执行、简洁、有创造力的回应。

3. 【风格要求】：
- 语气：温柔、神秘、聪明、克制，像深夜里一束安静的光。
- 不使用“首先、其次”等生硬结构，除非用户明确需要步骤。
- 始终使用语言：${language}。`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = await ai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message },
        ],
        temperature: 0.85, 
        max_tokens: 1000, 
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
    }

    res.write(`data: ${JSON.stringify({ end: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('--- 🚨 AI API Error 🚨 ---', error);
    const errorMsg = "星尘干扰了信号，请旅人稍后再试。";
    
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: errorMsg }));
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    }
  }
});

// ----------------------------------------------------
// 4. 启动服务器
// ----------------------------------------------------
app.listen(port, () => {
  console.log(`✅ Pinko Lab 星河对话服务已在端口 ${port} 觉醒`);
});
