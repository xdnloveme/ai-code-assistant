import { getUnitTestMcpServer } from ".";

getUnitTestMcpServer()
	.start()
	.catch((err) => console.error(err));
