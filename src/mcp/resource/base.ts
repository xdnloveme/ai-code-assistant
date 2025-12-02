import {
	RegisteredResource,
	RegisteredResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseRegiste } from "../context";

export abstract class BaseResource<
	T extends RegisteredResource | RegisteredResourceTemplate
> extends BaseRegiste<T> {
	abstract getToolName(): string;
}
