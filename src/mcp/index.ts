import { CodeAssistantMCPServer } from "./CodeAssistantMCPServer";

let codeAssistantMCPServer: CodeAssistantMCPServer;

export function getCodeAssistantMCPServer() {
	if (!codeAssistantMCPServer) {
		codeAssistantMCPServer = new CodeAssistantMCPServer();
	}

	return codeAssistantMCPServer;
}

export async function closeCodeAssistantMCPServer() {
	if (codeAssistantMCPServer) {
		await codeAssistantMCPServer.close();
		codeAssistantMCPServer = undefined!;
	}
}
