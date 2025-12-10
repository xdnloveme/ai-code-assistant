import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseTool } from "./base";
import z from "zod";
import { ASTParser } from "../utils/parser/ASTAccessor";
import { FunctionInfo } from "../utils/parser/types/ASTInfoType";


export class Analysis‌FunctionTool extends BaseTool<ReturnType<McpServer["registerTool"]>> {
	registe = () => {
		return this.server.registerTool(
			this.getToolName(),
			{
				title: "analysis top-level function from code string input",
				description: "get top-level function from code string input | 获取所有的位于代码顶层导出或者导入的函数，并进行结构化的分析",
				inputSchema: {
					code: z.string().describe('这是传入的代码片段'),
					language: z.enum(['typescript', 'javascript']).describe('这是可以选择的代码语言类型，现在只支持typescript，javascript'),
					fileName: z.string().describe('代码文件所属路径'),
					config: z.object({
						ast: z.boolean().describe('是否输出ast结构?')
					}).optional()
				},
				outputSchema: { 
					dependence: z.array(z.string()).optional().describe('这是代码的所有相关模块依赖文件地址'), 
					functions: z.array(z.object<FunctionInfo>()) 
				},
			},
			async ({ code, language, fileName, config = {} }) => {
				const astParser = new ASTParser();
				const result = astParser.parseFile(
					fileName,
					code
				);
				const output = { functions: result.functions };
				return {
					content: [{ type: "text", text: JSON.stringify(output) }],
					structuredContent: output,
				};
			}
		);
	};

	getToolName(): string {
		return "analysis-function-in-code-ast";
	}
}
