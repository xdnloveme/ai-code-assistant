import { BaseRegiste } from "../context";

export abstract class BaseTool<T> extends BaseRegiste<T> {
  abstract getToolName(): string;
}
