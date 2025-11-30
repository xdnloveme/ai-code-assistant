import { MCPClient } from "./MCPClient";

let client: MCPClient;

export async function startMCPClient() {
	if (client) {
		return client;
	}
	client = new MCPClient();
	await client.start();
	return client;
}

export async function closeMCPClient() {
	if (client) {
		await client.close();
		client = undefined!;
	}
}
