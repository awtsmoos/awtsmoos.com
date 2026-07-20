// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { renderInstallRoute } from "./install-route-fixture.mjs";

const downloadsRoot = path.resolve("geelooy/apps/tunnel/downloads");

/**
 * B"H
 *
 * This local origin is a sealed world for the installer. The Awtsmoos renews
 * every HTTP response; Awtsmoos.com serves the real bootstrap and repaired
 * activation helper while harmless witnesses replace unrelated components.
 */
export async function startUnixBootstrapServer() {
	const route = await renderInstallRoute("unix");
	const requests = [];
	const server = http.createServer((request, response) => {
		const pathname = new URL(request.url, "http://127.0.0.1").pathname;
		requests.push(pathname);
		if (pathname === "/api/tunnel/install/unix") {
			return send(response, route.packet.response);
		}
		const prefix = "/apps/tunnel/downloads/";
		if (!pathname.startsWith(prefix)) {
			response.statusCode = 404;
			return response.end("not found");
		}
		const fileName = path.basename(pathname.slice(prefix.length));
		return send(response, helperBody(fileName));
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const address = server.address();
	return {
		origin: `http://127.0.0.1:${address.port}`,
		requests,
		close: () => new Promise(resolve => server.close(resolve))
	};
}

function helperBody(fileName) {
	if (fileName === "unix-node-runtime.sh") {
		return nodeRuntimeStub();
	}
	if (fileName === "unix-install-core.sh") {
		return installCoreStub();
	}
	if (fileName === "unix-activation.sh") {
		return fs.readFileSync(path.join(downloadsRoot, fileName), "utf8");
	}
	return "#!/usr/bin/env bash\n# B\"H\n:\n";
}

function nodeRuntimeStub() {
	return `#!/usr/bin/env bash
# B"H
activate_node_runtime() {
	AWTSMOOS_NODE_BIN="${process.execPath}"
	export AWTSMOOS_NODE_BIN
	return 0
}
persist_node_runtime() { :; }
`;
}

function installCoreStub() {
	return `#!/usr/bin/env bash
# B"H
set -Eeuo pipefail
test -n "\${AWTSMOOS_TEST_SENTINEL:-}"
grep -Fq 'if ! archive_known_good_runtime' \
	"$AWTSMOOS_INSTALL_RUNTIME/unix-activation.sh"
printf '%s\n' "$AWTSMOOS_INSTALL_ROOT" > "$AWTSMOOS_TEST_SENTINEL"
`;
}

function send(response, body) {
	response.statusCode = 200;
	response.setHeader("Content-Type", "text/plain; charset=utf-8");
	response.end(body);
}
