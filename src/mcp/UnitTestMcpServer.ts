import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpServer, startHttpServer } from "./server";
import { RunTool } from "./tools";
import { ProjectResource } from "./resource/projectResource";

export class UnitTestMcpServer {
  private mcp: McpServer;

  constructor() {
    this.mcp = createMcpServer("1.0.0");
  }

  public start() {
    const mcp = this.getMCPServer();
    if (!mcp) {
      throw new Error("mcp instance must be initialized");
    }

    // run tool
    new RunTool(mcp).registe();
    // resource
    new ProjectResource(mcp).registe();

    startHttpServer();
  }

  public getMCPServer() {
    return this.mcp;
  }
}
