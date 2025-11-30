import { UnitTestMCPServer } from "./UnitTestMCPServer";

let unitTestMcpServer: UnitTestMCPServer;

export function getUnitTestMcpServer() {
	if (!unitTestMcpServer) {
		unitTestMcpServer = new UnitTestMCPServer();
	}

	return unitTestMcpServer;
}

export async function closeUnitTestMcpServer() {
	if (unitTestMcpServer) {
		await unitTestMcpServer.close();
		unitTestMcpServer = undefined!;
	}
}
