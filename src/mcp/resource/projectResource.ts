import {
  McpServer,
  RegisteredResource,
  RegisteredResourceTemplate,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseResource } from "./base";

export class ProjectResource extends BaseResource<
  ReturnType<McpServer["registerResource"]>
> {
  getToolName(): string {
    return "collectproject";
  }

  registe = () => {
    return this.server.registerResource(
      this.getToolName(),
      new ResourceTemplate("greeting://{name}", { list: undefined }),
      {
        title: "Greeting Resource", // Display name for UI
        description: "Dynamic greeting generator",
      },
      async (uri, { name }) => ({
        contents: [
          {
            uri: uri.href,
            text: `Hello, ${name}!`,
          },
        ],
      })
    );
  };
}
