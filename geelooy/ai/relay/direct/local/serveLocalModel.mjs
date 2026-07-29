//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { LocalInferencePaths } from "./LocalInferencePaths.mjs";
import { LocalModelHttpServer } from "./LocalModelHttpServer.mjs";

const paths = new LocalInferencePaths();
const server = new LocalModelHttpServer();

try {
	fs.writeFileSync(paths.pid, String(process.pid));
	await server.listen();
	console.log(JSON.stringify({ status: "ready", host: "127.0.0.1", port: 18080 }));
} catch (error) {
	fs.rmSync(paths.pid, { force: true });
	throw error;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.once(signal, async () => {
		await server.close().catch(() => undefined);
		fs.rmSync(paths.pid, { force: true });
		process.exit(0);
	});
}
