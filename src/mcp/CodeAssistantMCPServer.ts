import {
	McpServer,
	RegisteredResourceTemplate,
	RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { Annotation‌Tool } from "./tools";
import { ProjectResource } from "./resource/projectResource";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export class CodeAssistantMCPServer {
	private static singleton: CodeAssistantMCPServer;

	private mcp!: McpServer;
	private transport?: StdioServerTransport;
	private tools: { [k in string]: RegisteredTool } = {};
	private resources: { [k in string]: RegisteredResourceTemplate } = {};

	constructor() {
		if (CodeAssistantMCPServer.singleton) {
			return CodeAssistantMCPServer.singleton;
		}

		this.mcp = new McpServer({
			name: "ai-code-assistant-server",
			version: "1.0.0",
		});
		CodeAssistantMCPServer.singleton = this;
		return this;
	}

	public async start() {
		if (!this.mcp) {
			throw new Error("mcp instance must be initialized");
		}

		this._registeTools();
		this._registeResources();

		this.transport = new StdioServerTransport();
		const transport = this.transport;
		await this.mcp.connect(this.transport);
		await transport.start();

		console.log("MCP server running.....");
	}

	private _registeTools() {
		// run tool
		const annotation‌Tool = new Annotation‌Tool(this.mcp);
		const _annotation‌Registe = annotation‌Tool.registe();

		this.tools[annotation‌Tool.getToolName()] = _annotation‌Registe;
	}

	private _registeResources() {
		// resource
		const resources = new ProjectResource(this.mcp);
		const _resourceRegister = resources.registe();

		this.resources[resources.getToolName()] = _resourceRegister;
	}

	async __INTERNAL_closeMcpServer() {
		if (!this.mcp) {
			console.error("Mcp server dose not exists!");
			return;
		}

		await this.mcp.close();
		this.mcp = undefined!;
	}

	public async close() {
		await this.__INTERNAL_closeMcpServer();
		this.mcp = undefined!;
		this.tools = {};
		this.resources = {};

		if (this.transport) {
			await this.transport.close();
			this.transport = undefined;
		}
	}

	public getMCPServer() {
		return this.mcp;
	}
}
