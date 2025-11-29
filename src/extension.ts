// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { AITestCodeLensProvider } from "./extension/codelensProvider";
// import { main } from "./server/proxy";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let aiTestCodeLensProvider: AITestCodeLensProvider;
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	/**const disposable = vscode.commands.registerCommand(
    "ai-unit-test-simulate.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      //   main().then((message) => {

      //   });

      vscode.window.showInformationMessage("测试");
    }
  );

  context.subscriptions.push(disposable); */
	// 创建 CodeLens提供器
	aiTestCodeLensProvider = new AITestCodeLensProvider();

	// 注册 CodeLens提供器
	const codelensProvider = vscode.languages.registerCodeLensProvider(
		[
			{ scheme: "file", language: "javascript" },
			{ scheme: "file", language: "typescript" },
		],
		aiTestCodeLensProvider
	);

	// 注册命令
	const testFunctionCommand = vscode.commands.registerCommand(
		"extension.AITest",
		async (uri: vscode.Uri, range: vscode.Range, functionName: string) => {
			// 为用户提示信息
			vscode.window.showInformationMessage(
				`测试函数: ${uri}, ${range}, ${functionName}`
			);
			// 这里可以添加测试逻辑
		}
	);

	// 注册所有命令
	context.subscriptions.push(testFunctionCommand);

	return codelensProvider;
}

// This method is called when your extension is deactivated
export function deactivate() {}
