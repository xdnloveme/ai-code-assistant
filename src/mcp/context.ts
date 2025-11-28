import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export abstract class Context {
	constructor(server: McpServer) {
		this.server = server;
	}

	protected server: McpServer;

	getContext() {
		return {
			mcp: this.server,
		};
	}
}

export abstract class BaseRegiste<T> extends Context {
	abstract registe: () => T;
}
