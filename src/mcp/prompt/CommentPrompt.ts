import { RegisteredPrompt } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BasePrompt } from "./base";
import { readFileSync } from "fs";
import z from "zod";
import { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import path from "path";

export class CommentPrompt extends BasePrompt<RegisteredPrompt> {
	getToolName(): string {
		return "commentPrompt";
	}

	registe = () => {
		return this.server.registerPrompt(
			this.getToolName(),
			{
				title: "comment prompt",
				description: "注释工具提示词",
				argsSchema: {
					code: z.string().describe("这是传入的代码块"),
				},
			},
			async ({ code }): Promise<GetPromptResult> => {
				const promptPath = path.join(
					"/Users/jojo/Documents/ai-code-assistant/src/mcp/prompt/comment.txt"
				);
				const commentPrompt = readFileSync(
					promptPath.toString(),
					"utf8"
				);
				return {
					messages: [
						{
							role: "user",
							content: {
								type: "text",
								text: `${commentPrompt}\n\n请为以下代码生成 JSDoc 注释：\n\n\`\`\`typescript\n${code}\n\`\`\``,
							},
						},
					],
				};
			}
		);
	};
}
