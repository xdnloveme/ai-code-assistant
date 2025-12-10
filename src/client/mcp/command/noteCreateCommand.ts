import * as vscode from "vscode";
import { BaseCommand } from "./base";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { createPrompt } from "../../readPrompts";
import { setupOpenAI } from "../../../service/proxy";

export class NoteCreateCommand extends BaseCommand {
	registe(): vscode.Disposable {
		return vscode.commands.registerCommand(
			"extension.ExplanatoryNote",
			async (uri: vscode.Uri, text: string) => {
				const result = await this.client.sendRequest(
					{
						method: "tools/call",
						params: {
							name: "analysis-function-in-code-ast",
							arguments: {
								code: `${text}`,
								language: "typescript",
								fileName: uri.path,
							},
						},
					},
					CallToolResultSchema
				);
				const parsedResult = JSON.parse(result.content[0].text);
				const promptResult = await createPrompt(this.client, text);
				await setupOpenAI(promptResult.messages);
				const result2 = await this.client.readResource({
					uri: `file://${uri.path}`,
				});
				console.log(result2);
			}
		);
	}
}
