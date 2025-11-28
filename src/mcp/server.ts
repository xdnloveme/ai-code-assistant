import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import type { IncomingMessage, Server, ServerResponse } from "http";

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

export function closeMcpServer() {
	if (!server) {
		console.error("Mcp server dose not exists!");
		return;
	}

	server.close();
	server = undefined!;
}

// singleton
let httpServer:
	| Server<typeof IncomingMessage, typeof ServerResponse>
	| undefined = undefined;

export function startHttpServer() {
	if (httpServer) {
		throw new Error("app start twice error");
	}

	const app = express();
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
	httpServer = app
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

export function closeHttpServer() {
	if (!httpServer) {
		console.error(new Error("httpServer not start"));
		return;
	}

	httpServer.close();
}
