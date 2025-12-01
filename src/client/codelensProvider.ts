import * as vscode from "vscode";
import { ASTParser } from "./utils/parser/ASTAccessor";
import { ASTParseResult } from "./utils/parser/types/ASTInfoType";

// 主Provider：在函数上方增加AITest按钮
export class AITestCodeLensProvider implements vscode.CodeLensProvider {
	// 允许插件在适当时候刷新CodeLens
	private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses?: vscode.Event<void> | undefined =
		this._onDidChangeCodeLenses.event;

	public async provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): Promise<vscode.CodeLens[]> {
		// 1. 前置检查
		if (token.isCancellationRequested) {
			return [];
		}

		const codeLenses: vscode.CodeLens[] = [];

		try {
			// 解析文档中的函数
			const functionRanges = await this.parseFunctions(document);

			// 为每个函数创建CodeLens
			for (const range of functionRanges) {
				const testCodeLens = await this.createAITestCodeLens(
					document,
					range
				);
				if (testCodeLens) {
					codeLenses.push(testCodeLens);
				}

				// 检查取消令牌(用户快速滚动时避免不必要的计算)
				if (token.isCancellationRequested) {
					break;
				}
			}
		} catch (error) {
			console.error("AITest CodeLens error:", error);
		}

		return codeLenses;
	}

	// 解析文档中的函数定义
	private async parseFunctions(
		document: vscode.TextDocument
	): Promise<vscode.Range[]> {
		// 根据语言类型选择不同的解析器
		switch (document.languageId) {
			// case "javascript":
			case "typescript":
				const astParser = new ASTParser();
				const result = astParser.parseFile(
					document.uri.path,
					document.getText()
				);
				return this.parseTypescriptFunctions(result);
			default:
				return [];
		}
	}

	// JavaScript/TypeScript函数解析
	private parseTypescriptFunctions(result: ASTParseResult): vscode.Range[] {
		const functionRanges: vscode.Range[] = [];

		result.functions.forEach((func) => {
			const loc = func.location;
			functionRanges.push(new vscode.Range(loc.start, loc.end));
		});

		return functionRanges;
	}

	// 创建 AITest CodeLens
	private async createAITestCodeLens(
		document: vscode.TextDocument,
		functionRange: vscode.Range
	): Promise<vscode.CodeLens | null> {
		// 创建 CodeLens范围（函数上方）
		const codeLensRange = new vscode.Range(
			functionRange.start.line,
			0,
			functionRange.start.line,
			0
		);

		// 创建 Codelens命令
		const codeLens = new vscode.CodeLens(codeLensRange, {
			title: "生成注释",
			command: "extension.ExplanatoryNote",
			arguments: [document.uri, document.getText(functionRange)],
		});
		return codeLens;
	}
}
