import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-6d34b425f609436eb29e2d365a81ada5",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function main() {
  const completion = await openai.chat.completions.create({
    model: "qwen3-coder-plus",
    messages: [{ role: "user", content: "杭州的地理位置是哪里" }],
  });
  console.log(completion);
  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}
