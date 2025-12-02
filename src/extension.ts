import * as vscode from "vscode";
import { closeMCPClient, startMCPClient } from "./client";
import { closeCodeAssistantMCPServer } from "./mcp";
import { ExtensionContextRunner } from "./client/ExtensionRunner";

export async function activate(context: vscode.ExtensionContext) {
	const client = await startMCPClient();
	const runner = new ExtensionContextRunner(context, client);
	return runner.activate();
}

// This method is called when your extension is deactivated
export async function deactivate() {
	await closeMCPClient();
	await closeCodeAssistantMCPServer();
}
