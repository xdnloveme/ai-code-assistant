import * as vscode from "vscode";

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
			case "javascript":
			case "typescript":
				return this.parseJavaScriptFunctions(document);
			default:
				return [];
		}
	}

	// JavaScript/TypeScript函数解析
	private parseJavaScriptFunctions(
		document: vscode.TextDocument
	): vscode.Range[] {
		const functionRanges: vscode.Range[] = [];
		const text = document.getText();

		// 方法暂代考虑如何解析函数
		const functionPatterns = [
			// 函数声明: function name() {}
			/function\s+(\w+)\s*\([^)]*\)\s*\{/g,

			// 箭头函数: const name = () => {}
			/const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g,
		];

		for (const pattern of functionPatterns) {
			let match;
			while ((match = pattern.exec(text)) !== null) {
				const startPosition = document.positionAt(match.index);

				try {
					const functionRange = this.findFunctionRange(
						document,
						startPosition
					);
					if (
						functionRange &&
						this.isTopLevelFunction(document, functionRange)
					) {
						functionRanges.push(functionRange);
					}
				} catch (error) {
					console.warn(
						`Failed to parse function at ${match.index}:`,
						error
					);
				}
			}
		}
		return functionRanges;
	}

	// 查找函数的完整范围（包含函数体）
	private findFunctionRange(
		document: vscode.TextDocument,
		startPosition: vscode.Position
	) {
		let braceCount = 0;
		let inFunction = false;
		let functionStart: vscode.Position | null = null;
		let functionEnd: vscode.Position | null = null;

		// 从函数声明开始扫描
		for (
			let lineNum = startPosition.line;
			lineNum < document.lineCount;
			lineNum++
		) {
			const line = document.lineAt(lineNum);
			const text = line.text;

			for (
				let charIndex =
					lineNum === startPosition.line
						? startPosition.character
						: 0;
				charIndex < text.length;
				charIndex++
			) {
				const char = text[charIndex];
				if (!inFunction) {
					if (char === "{") {
						braceCount = 1;
						inFunction = true;
						functionStart = new vscode.Position(lineNum, charIndex);
						continue;
					}
				} else {
					// 统计大括号
					if (char === "{") {
						braceCount++;
					}
					if (char === "}") {
						braceCount--;
					}

					// 找到匹配的结束大括号
					if (braceCount === 0) {
						functionEnd = new vscode.Position(
							lineNum,
							charIndex + 1
						);
						break;
					}
				}
			}

			if (functionEnd) {
				break;
			}
		}

		return functionStart && functionEnd
			? new vscode.Range(functionStart, functionEnd)
			: null;
	}

	// 检查是否为顶层函数
	private isTopLevelFunction(
		document: vscode.TextDocument,
		range: vscode.Range
	): boolean {
		const functionStartLine = range.start.line;

		for (let lineNum = 0; lineNum < functionStartLine; lineNum++) {
			const line = document.lineAt(lineNum);
			if (line.text.includes("{") && !line.text.includes("}")) {
				return false;
			}
		}
		return true;
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
		});
		return codeLens;
	}
}
