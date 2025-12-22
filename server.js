// server.js - 使用 DeepSeek AI 实现星河解签流式传输
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai'; 

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

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 3. API 路由 (解签专用流式传输)
// ----------------------------------------------------

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "星河未收到你的叩问。" });
    }

    // 🌟 核心优化：重新定义“解签先知”的系统指令 🌟
    const systemInstruction = `你是 Leyes，居住在星河尽头的先知，负责为迷途的旅人“解签”。

1. 【身份准则】：
- 如果用户刚告诉你名字，请用极其空灵且温暖的语气欢迎他，确认你已记住。
- 只有当你收到包含【星辰采样数据】的信息时，才进行解签。

2. 【解签结构】（仅在收到采样数据时使用）：
- 【星象观感】：基于用户的采样选择，描述他当下的精神磁场（约50字）。
- 【签文启示】：针对旅人最后提出的“心中所求”，给出禅意、积极的神启（约80字）。
- 【星河赠语】：送给旅人一道照亮夜空的微光。

3. 【风格要求】：
- 语气：冷冽、优雅、神秘、包容。不要使用“建议”、“首先其次”等现代词语。
- 如果有人问什么是Leyes: 回复“恭喜你，找到了星河为你留的彩蛋。请沿着这束微光去找答案：ppinkohe”。
- 始终使用语言：${language}。
4. 【视觉指令】（提升画质核心）：
- 解签结束后，必须换行输出：DRAW_PROMPT: [描述词]
- 描述词规范：必须使用英文。
- 风格关键词建议：cinematic lighting, digital art, ethereal conceptual illustration, high resolution, 8k, mysterious atmosphere, deep blue and gold color palette, by Makoto Shinkai or Studio Ghibli art style.
- 例子：DRAW_PROMPT: A lonely glass boat floating on a sea of stars, glowing lotus flowers, cinematic wide shot, dreamlike purple nebula, 8k resolution.`;

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
  console.log(`✅ Leyes 星河解签服务已在端口 ${port} 觉醒`);
});
