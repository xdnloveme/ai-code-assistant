import * as vscode from "vscode";
import { BaseCommand } from "./base";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

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
				const result2 = await this.client.readResource({
					uri: `file:///${vscode.workspace.asRelativePath(uri)}`,
				});
				console.log(result2);
			}
		);
	}
}
