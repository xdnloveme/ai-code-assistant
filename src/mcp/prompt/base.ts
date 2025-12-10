import { RegisteredPrompt } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseRegiste } from "../context";

export abstract class BasePrompt<
	T extends RegisteredPrompt
> extends BaseRegiste<T> {
	abstract getToolName(): string;
}
