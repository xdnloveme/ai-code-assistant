import { MCPClient } from "../mcp/MCPClient";
import { NoteCreateCommand } from "./noteCreateCommand";
import * as vscode from "vscode";

const commands = [NoteCreateCommand];

export function createCommands(client: MCPClient) {
	return {
		registe() {
			const receive: vscode.Disposable[] = [];
			while (commands.length) {
				const _CommandConstructor = commands.pop();
				receive.push(new _CommandConstructor!(client).registe());
			}

			return receive;
		},
	};
}
