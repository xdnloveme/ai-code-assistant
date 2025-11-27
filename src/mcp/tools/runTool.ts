import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseTool } from "./base";
import z from "zod";

export class RunTool extends BaseTool<ReturnType<McpServer["registerTool"]>> {
  registe = () => {
    return this.server.registerTool(
      this.getToolName(),
      {
        title: "Addition Tool",
        description: "Add two numbers",
        inputSchema: { a: z.number(), b: z.number() },
        outputSchema: { result: z.number() },
      },
      async ({ a, b }) => {
        const output = { result: a + b };
        return {
          content: [{ type: "text", text: JSON.stringify(output) }],
          structuredContent: output,
        };
      }
    );
  };

  getToolName(): string {
    return "run";
  }
}
