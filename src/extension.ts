import * as vscode from "vscode";
import { AITestCodeLensProvider } from "./extension/codelensProvider";
import { closeMCPClient, startMCPClient } from "./client";
import { closeUnitTestMcpServer } from "./mcp";

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

	// 注册命令
	const testFunctionCommand = vscode.commands.registerCommand(
		"extension.AITest",
		async (uri: vscode.Uri, range: vscode.Range, functionName: string) => {
			// 为用户提示信息
			vscode.window.showInformationMessage(
				`测试函数: ${uri}, ${range}, ${functionName}`
			);
			// 这里可以添加测试逻辑
		}
	);

	const client = await startMCPClient();

	// 注册所有命令
	context.subscriptions.push(testFunctionCommand);
	return codelensProvider;
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await closeMCPClient();
	await closeUnitTestMcpServer();
}
