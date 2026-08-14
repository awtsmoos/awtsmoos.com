// B"H
// Boruch Hashem
// Blessed is He
const fs = require("node:fs");
const path = require("node:path");

/** Builds a synthetic predecessor with production identity-bound receipts. */
function fixtureMainSource() {
	return `// B"H
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

async function main() {
	const root = process.env.AWTSMOOS_INSTALL_ROOT || __dirname;
	const config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
	const runtimeVersion = fs.readFileSync(path.join(root, "install-state.txt"), "utf8").trim();
	const activationId = process.env.AWTSMOOS_ACTIVATION_ID || "";
	const tunnelId = "tun_transaction_fixture";
	let server = null;

	function writeJson(name, value) {
		const target = path.join(root, name);
		const temporary = target + "." + process.pid + ".tmp";
		fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + "\\n");
		fs.renameSync(temporary, target);
	}

	function writeHealth() {
		const now = new Date().toISOString();
		writeJson("connection-state.json", {
			schemaVersion: 4, state: "registered", pid: process.pid, tunnelId,
			tunnelName: config.tunnelName, agentVersion: "fixture-agent",
			activationId, runtimeVersion, generation: 1, reconnectAttempt: 0,
			updatedAt: now, registeredAt: now, lastServerMessageAt: now,
			serverTime: now, reason: ""
		});
		writeJson("project-root-state.json", {
			schemaVersion: 2, ok: true, state: "ready", pid: process.pid,
			activationId, runtimeVersion, root: config.root,
			canonicalRoot: fs.realpathSync(config.root), allowWrite: true,
			readable: true, writable: true,
			request: { action: "projectRootProbe", root: config.root, read: true, write: true },
			response: { ok: true, code: "", message: "", fixture: true },
			updatedAt: now, code: "fixture_root_ready"
		});
	}

	function startActivationApi() {
		if (process.env.AWTSMOOS_LOCAL_API !== "1") return;
		const host = process.env.AWTSMOOS_LOCAL_API_HOST || "127.0.0.1";
		const port = Number(process.env.AWTSMOOS_LOCAL_API_PORT || 0);
		server = http.createServer((request, response) => {
			let body = "";
			request.setEncoding("utf8");
			request.on("data", chunk => body += chunk);
			request.on("end", () => {
				let action = {};
				try { action = JSON.parse(body || "{}"); } catch {}
				const ok = request.method === "POST" && request.url === "/fs" &&
					action.action === "stat" && action.p === ".";
				response.writeHead(ok ? 200 : 400, { "content-type": "application/json" });
				response.end(JSON.stringify({ ok, fixture: true, root: config.root }));
			});
		});
		server.listen(port, host);
	}

	function stop() {
		if (server) server.close(() => process.exit(0));
		else process.exit(0);
	}
	writeHealth();
	startActivationApi();
	setInterval(writeHealth, 1000);
	process.on("SIGTERM", stop);
}

module.exports = { main };
`;
}

function writeRuntimeMetadata(fixture, source, version) {
	const manifest = fs.readFileSync(path.join(
		fixture.repositoryRoot,
		"geelooy/apps/tunnel/agent/manifest.txt"
	));
	fs.writeFileSync(path.join(fixture.runtimeRoot, "installed-manifest.txt"), manifest);
	fs.writeFileSync(path.join(fixture.runtimeRoot, "install-state.txt"), `${version}\n`);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "install-manifest.sha256"),
		`${source.manifestSha256}\n`
	);
	fs.writeFileSync(path.join(fixture.runtimeRoot, "config.json"), `${JSON.stringify({
		tunnelName: "awt-transaction-rollback-test",
		root: fixture.temporaryRoot,
		allowWrite: true,
		localApi: { enabled: false }
	}, null, 2)}\n`);
	fs.writeFileSync(path.join(fixture.runtimeRoot, "sentinel.txt"), "older-runtime\n");
}

module.exports = { fixtureMainSource, writeRuntimeMetadata };
