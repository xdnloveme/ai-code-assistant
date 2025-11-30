import * as vscode from "vscode";
import { closeUnitTestMcpServer } from "./mcp";
import { closeMCPClient, startMCPClient } from "./client";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const client = await startMCPClient();
	const disposable = vscode.commands.registerCommand(
		"ai-unit-test-simulate.createUnitTest",
		() => {
			client
				.getClient()
				.listTools()
				.then((list) => {
					console.log(
						"可用tools",
						list.tools.map((t) => t.name)
					);
				});
		}
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await closeMCPClient();
	await closeUnitTestMcpServer();
}
