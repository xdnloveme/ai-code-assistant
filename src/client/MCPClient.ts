import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

import path from "path";

export class MCPClient {
	private client: Client;

	private __INTERNAL_running = false;

	constructor() {
		this.client = new Client({
			name: "ai-unit-test-simulate-client",
			version: "1.0.0",
		});
	}

	getClient() {
		return this.client;
	}

	async start() {
		if (this.isRunning) {
			console.error("unit-test-mcp-client already be running");
			return;
		}

		try {
			const serverScriptPath = path.join(
				__dirname,
				"./mcp/serverScript.js"
			);

			// 创建传输层
			const transport = new StdioClientTransport({
				command: "node",
				args: [serverScriptPath],
			});
			await this.client.connect(transport);

			const tools = await this.client.listTools();
			console.log(
				"可用的tools有：",
				tools.tools.map((t) => t.name)
			);

			this.client.onclose = () => {
				transport.close();
				console.log("进程清理完毕, pid=", transport.pid);
			};

			console.log("✅ MCP客户端连接成功");
			this.__INTERNAL_running = true;
		} catch (e) {
			// 6. 关闭连接
			await this.client.close();
			this.__INTERNAL_running = false;
		}
	}

	async close() {
		await this.client.close();
		this.__INTERNAL_running = true;
	}

	get isRunning() {
		return this.__INTERNAL_running;
	}

	sendRequest(method: string, params: object) {}
}
