import { BaseRegiste } from "../context";

export abstract class BaseResource<T> extends BaseRegiste<T> {
	abstract getToolName(): string;
}
