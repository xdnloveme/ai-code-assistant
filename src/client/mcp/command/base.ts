import * as vscode from "vscode";
import type { MCPClient } from "../MCPClient";

export abstract class BaseCommand {
	constructor(private _client: MCPClient) {}

	abstract registe(): vscode.Disposable;

	protected get client() {
		return this._client;
	}
}
