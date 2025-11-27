import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import type ExpressNameSpace from "express-serve-static-core";

// singleton
let server: McpServer;

export type { server };

export function createMcpServer(version = "1.0.0") {
  if (!server) {
    server = new McpServer({
      name: "ai-unit-test-simulate-server",
      version,
    });
  }
  return server;
}

// singleton
let app: ExpressNameSpace.Express | undefined = undefined;

export function startHttpServer() {
  if (app) {
    throw new Error("app start twice error");
  }

  app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");
  app
    .listen(port, () => {
      console.log(
        `ai-unit-test-simulate MCP Server running on http://localhost:${port}/mcp`
      );
    })
    .on("error", (error) => {
      console.error("ai-unit-test-simulate Server error:", error);
      process.exit(1);
    });
}
