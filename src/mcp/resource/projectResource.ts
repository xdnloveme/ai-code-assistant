import {
	RegisteredResourceTemplate,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseResource } from "./base";
import { readFileSync } from "node:fs";
import path from "node:path";

export class ProjectResource extends BaseResource<RegisteredResourceTemplate> {
	getToolName(): string {
		return "collectproject";
	}

	registe = () => {
		return this.server.registerResource(
			this.getToolName(),
			new ResourceTemplate("file://{projectFilePath}", {
				list: undefined,
			}),
			{
				title: "reading project Resource | 获取当前载入项目所在的目标地址下的文件内容，支持.ts格式", // Display name for UI
				description: "reading project Resource project files",
			},
			async (uri, { projectFilePath }) => {
				const content = readFileSync(projectFilePath[0], "utf8");
				return {
					contents: [
						{
							uri: uri.href,
							text: `${content}`,
						},
					],
				};
			}
		);
	};
}
