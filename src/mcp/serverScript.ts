import { getCodeAssistantMCPServer } from ".";

getCodeAssistantMCPServer()
	.start()
	.catch((err) => console.error(err));
