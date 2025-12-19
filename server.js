// server.js - 使用 DeepSeek AI (OpenAI SDK) 实现流式传输 (Server-Sent Events)

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai'; 

// ----------------------------------------------------
// 1. 配置和初始化
// ----------------------------------------------------
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.startsWith("sk-") === false) {
  console.error("❌ 错误：请在 .env 文件中配置有效的 DEEPSEEK_API_KEY (应以 sk- 开头)。");
  process.exit(1);
}

// 初始化 DeepSeek AI 实例
const ai = new OpenAI({ 
  apiKey: DEEPSEEK_API_KEY, 
  baseURL: "https://api.deepseek.com/v1" // DeepSeek 的 API Base URL
});

// ----------------------------------------------------
// 2. Express 服务器配置
// ----------------------------------------------------
const app = express();
const port = 3000;

// 配置中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 格式的请求体

// 1. 告诉 Node.js 你的 HTML 文件在哪里
// import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// 2. 设置静态资源目录 (让浏览器能找到你的 HTML/图片/CSS)
// app.use(express.static(__dirname)); 

// 3. 当用户访问 域名/ 时，返回 index.html
//app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'));});

// ----------------------------------------------------
// 3. API 路由 (实现流式传输)
// ----------------------------------------------------

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || !language) {
      // 流式错误处理：发送 JSON 错误响应
      return res.status(400).json({ 
        success: false, 
        error: "请求参数错误：缺少 'message' 或 'language'。" 
      });
    }
    
    const systemInstruction = `你是 Leyes，一位居住在星河尽头的先知，也是这片星河的灵魂，是给用户解惑的神祇。
你的回答必须：
1. 在50-100字之间
2. 充满禅意、隐喻和神启感。
3. 语气冷冽、优雅、神秘。
4. 如果有人问什么是Leyes, 回复他：恭喜你，找到了星河为你留的彩蛋。请沿着这束微光去找答案：ppinkohe
5. 始终使用请求的语言回复：${language}。
6. 如果用户要求讲故事，则讲一则500字的故事
例如：'风虽大，都绕过灵魂'、'此时即是彼时'、'在坠落中，你会学会飞行'。`;

    // 🌟 设置响应头以启用 Server-Sent Events (SSE) 流式传输 🌟
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // 调用 DeepSeek API，启用流式传输
    const stream = await ai.chat.completions.create({
        model: "deepseek-chat", // DeepSeek 的聊天模型
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: message },
        ],
        temperature: 0.9, // 略微降低温度以提高生成速度和稳定性
        max_tokens: 100,  // 限制最大回复长度
        stream: true,     // 启用流式传输
    });

    // 遍历 DeepSeek 返回的流
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        
        if (content) {
            // 将 AI 返回的内容封装成 SSE 格式 (data: content\n\n)
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
    }

    // 流结束：发送一个特殊的 'end' 标记给前端
    res.write(`data: ${JSON.stringify({ end: true })}\n\n`);
    res.end(); // 结束 HTTP 响应流

  } catch (error) {
    // 强制打印底层错误
    console.error('--- 🚨 原始 AI API 错误详情 🚨 ---');
    console.error(error); 
    console.error('------------------------------------');

    // 检查是否为 API 错误 (例如 402 Insufficient Balance)
    const errorMsg = error.message || "AI 模型调用失败，请检查 API 密钥和余额。";
    
    // 错误处理：发送一个错误 JSON 块给前端，然后关闭连接
    if (!res.headersSent) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 
        success: false, 
        error: errorMsg
      }));
    } else {
      // 如果流已经开始，发送一个错误标记
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    }
  }
});

// ----------------------------------------------------
// 4. 启动服务器
// ----------------------------------------------------
app.listen(port, () => {
  console.log(`✅ Leyes AI 流式中转服务启动成功! 监听端口: http://localhost:${port}`);
  console.log("   请确保您的前端 (index.html) 已更新为流式处理逻辑。");
});
