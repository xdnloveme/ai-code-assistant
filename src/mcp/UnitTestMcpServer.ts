import type {
	McpServer,
	RegisteredResourceTemplate,
	RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	closeHttpServer,
	closeMcpServer,
	createMcpServer,
	startHttpServer,
} from "./server";
import { RunTool } from "./tools";
import { ProjectResource } from "./resource/projectResource";

export class UnitTestMcpServer {
	private static singleton: UnitTestMcpServer;

	private mcp!: McpServer;
	private tools: { [k in string]: RegisteredTool } = {};
	private resources: { [k in string]: RegisteredResourceTemplate } = {};

	constructor() {
		if (UnitTestMcpServer.singleton) {
			return UnitTestMcpServer.singleton;
		}

		this.mcp = createMcpServer("1.0.0");
		UnitTestMcpServer.singleton = this;
	}

	public start() {
		const mcp = this.getMCPServer();
		if (!mcp) {
			throw new Error("mcp instance must be initialized");
		}

		this._registeTools();
		this._registeResources();

		startHttpServer();
	}

	private _registeTools() {
		// run tool
		const runTool = new RunTool(this.mcp);
		const _runToolRegister = runTool.registe();

		this.tools[runTool.getToolName()] = _runToolRegister;
	}

	private _registeResources() {
		// resource
		const resources = new ProjectResource(this.mcp);
		const _resourceRegister = resources.registe();

		this.resources[resources.getToolName()] = _resourceRegister;
	}

	public close() {
		closeMcpServer();
		this.mcp = undefined!;
		this.tools = {};
		this.resources = {};
		closeHttpServer();
	}

	public getMCPServer() {
		return this.mcp;
	}
}
