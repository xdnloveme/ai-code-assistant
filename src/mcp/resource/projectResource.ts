import {
	RegisteredResourceTemplate,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseResource } from "./base";
import { readFileSync } from "node:fs";

export class ProjectResource extends BaseResource<RegisteredResourceTemplate> {
	getToolName(): string {
		return "collectproject";
	}

	registe = () => {
		return this.server.registerResource(
			this.getToolName(),
			new ResourceTemplate("file://{+path}", {
				list: undefined,
			}),
			{
				title: "reading project Resource | 获取当前载入项目所在的目标地址下的文件内容，支持.ts格式", // Display name for UI
				description: "reading project Resource project files",
			},
			async (uri, { path: filePath }) => {
				const content = readFileSync(filePath.toString(), "utf8");
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
