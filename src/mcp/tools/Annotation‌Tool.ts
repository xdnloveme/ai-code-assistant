import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseTool } from "./base";
import z from "zod";

export class Annotation‌Tool extends BaseTool<ReturnType<McpServer["registerTool"]>> {
	registe = () => {
		return this.server.registerTool(
			this.getToolName(),
			{
				title: "generate Annotation‌Tool",
				description: "生成注释",
				inputSchema: { text: z.string() },
				outputSchema: { result: z.string() },
			},
			async ({ text }) => {
				const output = { result: `请生成以下代码的注释：${text}` };
				return {
					content: [{ type: "text", text: JSON.stringify(output) }],
					structuredContent: output,
				};
			}
		);
	};

	getToolName(): string {
		return "annotation-generate";
	}
}
