import * as ts from "typescript";
import {
	ClassInfo,
	ExportInfo,
	FunctionInfo,
	ImportInfo,
	Location,
	MethodInfo,
	ParameterInfo,
	ASTParseResult,
	PropertyInfo,
} from "./types/ASTInfoType";

export class ASTParser {
	public parseFile(fileName: string, text: string): ASTParseResult {
		const sourceFile = ts.createSourceFile(
			fileName,
			text,
			ts.ScriptTarget.Latest
		);
		if (!sourceFile) {
			throw new Error(`无法解析文件: ${fileName}`);
		}

		const result: ASTParseResult = {
			functions: [],
			classes: [],
			imports: [],
			exports: [],
		};

		this.visitNode(sourceFile, result, sourceFile);
		return result;
	}

	private visitNode(
		node: ts.Node,
		result: ASTParseResult,
		sourceFile: ts.SourceFile
	): void {
		// 解析函数声明
		if (ts.isFunctionDeclaration(node) && node.name) {
			const funcInfo = this.parseFunctionDeclaration(node, sourceFile);
			result.functions.push(funcInfo);
		}

		// 解析函数表达式（如 export const func = () => {}）
		if (
			ts.isVariableStatement(node) &&
			node.declarationList.declarations[0]?.initializer &&
			(ts.isArrowFunction(
				node.declarationList.declarations[0].initializer
			) ||
				ts.isFunctionExpression(
					node.declarationList.declarations[0].initializer
				))
		) {
			const funcInfo = this.parseFunctionExpression(node, sourceFile);
			if (funcInfo) {
				result.functions.push(funcInfo);
			}
		}

		// 解析类声明
		if (ts.isClassDeclaration(node) && node.name) {
			const classInfo = this.parseClassDeclaration(node, sourceFile);
			result.classes.push(classInfo);
		}

		// 解析导入声明
		if (ts.isImportDeclaration(node)) {
			const importInfo = this.parseImportDeclaration(node, sourceFile);
			result.imports.push(importInfo);
		}

		// 解析导出声明
		if (ts.isExportDeclaration(node)) {
			const exportInfos = this.parseExportDeclaration(node);
			result.exports.push(...exportInfos);
		}

		// 解析命名导出（export function, export class, export const）
		if (ts.isExportAssignment(node)) {
			const exportInfo = this.parseExportAssignment(node, sourceFile);
			if (exportInfo) {
				result.exports.push(exportInfo);
			}
		}

		// 递归遍历子节点
		ts.forEachChild(node, (child) =>
			this.visitNode(child, result, sourceFile)
		);
	}

	private parseFunctionDeclaration(
		node: ts.FunctionDeclaration,
		sourceFile: ts.SourceFile
	): FunctionInfo {
		const modifiers = node.modifiers || [];
		const isExported = modifiers.some(
			(m) => m.kind === ts.SyntaxKind.ExportKeyword
		);
		const isAsync = modifiers.some(
			(m) => m.kind === ts.SyntaxKind.AsyncKeyword
		);

		const parameters: ParameterInfo[] = [];
		node.parameters.forEach((param) => {
			if (ts.isParameter(param) && param.name) {
				const paramName = param.name.getText(sourceFile);
				const paramType = param.type
					? param.type.getText(sourceFile)
					: "any";
				const isOptional = param.questionToken !== undefined;

				parameters.push({
					name: paramName,
					type: paramType,
					optional: isOptional,
				});
			}
		});

		const returnType = node.type ? node.type.getText(sourceFile) : "void";

		const location = this.getNodeLocation(node, sourceFile);

		return {
			name: node.name!.getText(sourceFile),
			parameters,
			returnType,
			isAsync,
			isExported,
			location,
		};
	}

	private parseFunctionExpression(
		node: ts.VariableStatement,
		sourceFile: ts.SourceFile
	): FunctionInfo | null {
		const declaration = node.declarationList.declarations[0];
		if (!declaration.name || !declaration.initializer) {
			return null;
		}

		const funcNode = declaration.initializer;
		const modifiers = node.modifiers || [];
		const isExported = modifiers.some(
			(m) => m.kind === ts.SyntaxKind.ExportKeyword
		);

		let isAsync = false;
		let parameters: ParameterInfo[] = [];
		let returnType = "any";

		if (ts.isArrowFunction(funcNode)) {
			isAsync = !!funcNode.modifiers?.some(
				(m) => m.kind === ts.SyntaxKind.AsyncKeyword
			);

			funcNode.parameters.forEach((param) => {
				if (ts.isParameter(param) && param.name) {
					const paramName = param.name.getText(sourceFile);
					const paramType = param.type
						? param.type.getText(sourceFile)
						: "any";
					const isOptional = param.questionToken !== undefined;

					parameters.push({
						name: paramName,
						type: paramType,
						optional: isOptional,
					});
				}
			});

			if (funcNode.type) {
				returnType = funcNode.type.getText(sourceFile);
			}
		}

		const location = this.getNodeLocation(declaration, sourceFile);

		return {
			name: declaration.name.getText(sourceFile),
			parameters,
			returnType,
			isAsync,
			isExported,
			location,
		};
	}

	private parseClassDeclaration(
		node: ts.ClassDeclaration,
		sourceFile: ts.SourceFile
	): ClassInfo {
		const modifiers = node.modifiers || [];
		const isExported = modifiers.some(
			(m) => m.kind === ts.SyntaxKind.ExportKeyword
		);
		const isAbstract = modifiers.some(
			(m) => m.kind === ts.SyntaxKind.AbstractKeyword
		);

		const methods: MethodInfo[] = [];
		const properties: PropertyInfo[] = [];

		node.members.forEach((member) => {
			// 解析方法
			if (ts.isMethodDeclaration(member) && member.name) {
				const methodModifiers = member.modifiers || [];
				const isStatic = methodModifiers.some(
					(m) => m.kind === ts.SyntaxKind.StaticKeyword
				);
				const isAsync = methodModifiers.some(
					(m) => m.kind === ts.SyntaxKind.AsyncKeyword
				);
				const isAbstract = methodModifiers.some(
					(m) => m.kind === ts.SyntaxKind.AbstractKeyword
				);

				const parameters: ParameterInfo[] = [];
				member.parameters.forEach((param) => {
					if (ts.isParameter(param) && param.name) {
						const paramName = param.name.getText(sourceFile);
						const paramType = param.type
							? param.type.getText(sourceFile)
							: "any";
						const isOptional = param.questionToken !== undefined;

						parameters.push({
							name: paramName,
							type: paramType,
							optional: isOptional,
						});
					}
				});

				const returnType = member.type
					? member.type.getText(sourceFile)
					: "void";

				methods.push({
					name: member.name.getText(sourceFile),
					parameters,
					returnType,
					isAsync,
					isStatic,
					isAbstract,
				});
			}

			// 解析属性
			if (ts.isPropertyDeclaration(member) && member.name) {
				const propertyModifiers = member.modifiers || [];
				const isStatic = propertyModifiers.some(
					(m) => m.kind === ts.SyntaxKind.StaticKeyword
				);
				const isOptional = member.questionToken !== undefined;

				properties.push({
					name: member.name.getText(sourceFile),
					type: member.type ? member.type.getText(sourceFile) : "any",
					isOptional,
					isStatic,
				});
			}
		});

		const location = this.getNodeLocation(node, sourceFile);

		return {
			name: node.name!.getText(sourceFile),
			methods,
			properties,
			isExported,
			isAbstract,
			location,
		};
	}

	private parseImportDeclaration(
		node: ts.ImportDeclaration,
		sourceFile: ts.SourceFile
	): ImportInfo {
		const moduleName = node.moduleSpecifier
			.getText(sourceFile)
			.replace(/['"]/g, "");
		const importClause = node.importClause;
		let defaultImport: string | null = null;
		const namedImports: string[] = [];
		let isTypeOnly = false;

		if (importClause) {
			// 检查是否为 type-only 导入
			isTypeOnly = importClause.isTypeOnly || false;

			// 解析默认导入
			if (importClause.name) {
				defaultImport = importClause.name.text;
			}

			// 解析命名导入
			if (
				importClause.namedBindings &&
				ts.isNamedImports(importClause.namedBindings)
			) {
				importClause.namedBindings.elements.forEach((element) => {
					namedImports.push(element.name.text);
				});
			}
		}

		return {
			moduleName,
			namedImports,
			defaultImport,
			isTypeOnly,
		};
	}

	private parseExportDeclaration(node: ts.ExportDeclaration): ExportInfo[] {
		const exportInfos: ExportInfo[] = [];
		const isTypeOnly = node.isTypeOnly || false;

		if (node.exportClause && ts.isNamedExports(node.exportClause)) {
			node.exportClause.elements.forEach((element) => {
				exportInfos.push({
					name: element.name.text,
					isTypeOnly,
					isDefault: false,
					kind: "variable", // 这里简化处理，实际需要根据具体类型判断
				});
			});
		}

		return exportInfos;
	}

	private parseExportAssignment(
		node: ts.ExportAssignment,
		sourceFile: ts.SourceFile
	): ExportInfo | null {
		if (node.expression && ts.isIdentifier(node.expression)) {
			return {
				name: node.expression.text,
				isTypeOnly: false,
				isDefault: !node.isExportEquals,
				kind: "variable", // 这里简化处理
			};
		}
		return null;
	}

	private getNodeLocation(
		node: ts.Node,
		sourceFile: ts.SourceFile
	): {
		start: ts.LineAndCharacter;
		end: ts.LineAndCharacter;
	} {
		const start = sourceFile.getLineAndCharacterOfPosition(
			node.getStart(sourceFile, false)
		);
		const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
		return {
			start,
			end,
		};
	}
}
