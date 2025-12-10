import {
	GetPromptResult,
	GetPromptResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCPClient } from "../mcp/MCPClient";

export async function createPrompt(client: MCPClient, code: string) {
	const promptResult = await client.sendRequest(
		{
			method: "prompts/get",
			params: {
				name: "commentPrompt",
				arguments: {
					code,
				},
			},
		},
		GetPromptResultSchema
	);
	return promptResult as GetPromptResult;
}
