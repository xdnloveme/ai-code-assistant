import {
	McpServer,
	RegisteredResourceTemplate,
	RegisteredResource,
	RegisteredTool,
	RegisteredPrompt,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { Analysis‌FunctionTool } from "./tools";
import { ProjectResource } from "./resource/projectResource";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CommentPrompt } from "./prompt";

export class CodeAssistantMCPServer {
	private static singleton: CodeAssistantMCPServer;

	private mcp!: McpServer;
	private transport?: StdioServerTransport;
	private tools: { [k in string]: RegisteredTool } = {};
	private resources: { [k in string]: RegisteredResourceTemplate | RegisteredResource } = {};
	private prompts: { [k in string]: RegisteredPrompt} = {};

	constructor() {
		if (CodeAssistantMCPServer.singleton) {
			return CodeAssistantMCPServer.singleton;
		}

		this.mcp = new McpServer({
			name: "ai-code-assistant-server",
			version: "1.0.0",
		}, {
			capabilities: {
				resources: {},
				prompts: {},
			}
		});
		CodeAssistantMCPServer.singleton = this;
		return this;
	}

	public async start() {
		if (!this.mcp) {
			throw new Error("mcp instance must be initialized");
		}

		this._registeResources();
		this._registeTools();
		this._registePrompts();
		

		this.transport = new StdioServerTransport();
		const transport = this.transport;
		await this.mcp.connect(this.transport);
		await transport.start();

		console.log("MCP server running.....");
	}

	private _registeTools() {
		// run tool
		const analysis‌FunctionTool = new Analysis‌FunctionTool(this.mcp);
		const _analysis‌FunctionTool = analysis‌FunctionTool.registe();

		this.tools[analysis‌FunctionTool.getToolName()] = _analysis‌FunctionTool;
	}

	private _registeResources() {
		// resource
		const resources = new ProjectResource(this.mcp);
		const _resourceRegister = resources.registe();

		this.resources[resources.getToolName()] = _resourceRegister;
	}

	private _registePrompts(){
		// prompts
		const prompts = new CommentPrompt(this.mcp);
		const _promptRegister = prompts.registe();

		this.prompts[prompts.getToolName()] = _promptRegister;
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
