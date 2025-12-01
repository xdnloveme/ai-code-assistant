import * as vscode from "vscode";
import {
	closeMCPClient,
	startMCPClient,
	AITestCodeLensProvider,
} from "./client";
import { closeCodeAssistantMCPServer } from "./mcp";
import {
	CallToolResultSchema,
	ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

export async function activate(context: vscode.ExtensionContext) {
	let aiTestCodeLensProvider: AITestCodeLensProvider;
	// 创建 CodeLens提供器
	aiTestCodeLensProvider = new AITestCodeLensProvider();

	// 注册 CodeLens提供器
	const codelensProvider = vscode.languages.registerCodeLensProvider(
		[
			{ scheme: "file", language: "javascript" },
			{ scheme: "file", language: "typescript" },
		],
		aiTestCodeLensProvider
	);

	const client = await startMCPClient();

	// 注册命令
	const testFunctionCommand = vscode.commands.registerCommand(
		"extension.ExplanatoryNote",
		async (uri: vscode.Uri, text: string) => {
			// List available tools
			const toolList = await client.sendRequest(
				{ method: "tools/list" },
				ListToolsResultSchema
			);
			console.log("toolList", toolList);
			const result = await client.sendRequest(
				{
					method: "tools/call",
					params: {
						name: "annotation-generate",
						arguments: {
							text: `"${text}"`,
						},
					},
				},
				CallToolResultSchema
			);
			console.log(result);
		}
	);

	// 注册所有命令
	context.subscriptions.push(testFunctionCommand);
	return codelensProvider;
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await closeMCPClient();
	await closeCodeAssistantMCPServer();
}
