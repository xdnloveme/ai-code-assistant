import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI({
	apiKey: process.env.DASHSCOPE_API_KEY,
	baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function setupOpenAI(messageList: PromptMessage[]) {
	const message = messageList[0];

	if (message.content.type === "text") {
		const completion = await openai.chat.completions.create({
			model: "qwen3-coder-plus",
			messages: [
				{
					role: message.role,
					content: message.content.text,
				},
			],
		});
		console.log(completion);
		console.log(completion.choices[0].message.content);
		return completion.choices[0].message.content;
	}
}
