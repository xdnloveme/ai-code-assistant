import * as vscode from "vscode";

import { CommentButtonProvider } from "./providers/CommentButtonProvider";
import { MCPClient } from "./mcp/MCPClient";
import { createCommands } from "./mcp/command";

export class ExtensionContextRunner {
	static instance: ExtensionContextRunner;

	constructor(
		private readonly extensionContext: vscode.ExtensionContext,
		private mcpClient: MCPClient
	) {
		if (!ExtensionContextRunner.instance) {
			ExtensionContextRunner.instance = this;
		}

		return ExtensionContextRunner.instance;
	}

	private commentButtonProvider: CommentButtonProvider | undefined;

	activate() {
		// 注册命令
		const subscriptions = createCommands(this.client).registe();
		// 注册所有命令
		this.context.subscriptions.push(...subscriptions);
		this.commentButtonProvider = new CommentButtonProvider(this.client);

		return vscode.languages.registerCodeLensProvider(
			[
				{ scheme: "file", language: "javascript" },
				{ scheme: "file", language: "typescript" },
			],
			this.commentButtonProvider
		);
	}

	get client() {
		return this.mcpClient;
	}

	get context() {
		return this.extensionContext;
	}
}
