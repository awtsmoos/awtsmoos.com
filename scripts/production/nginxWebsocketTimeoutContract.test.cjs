// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-nginx-test-"));
const config = path.join(temporary, "awtsmoos.com");
fs.writeFileSync(config, `server {\n  location / {\n    proxy_http_version 1.1;\n  }\n}\n`);

const environment = {
	...process.env,
	AWTSMOOS_NGINX_CONFIG: config,
	AWTSMOOS_NGINX_SKIP_RELOAD: "1"
};
const script = path.join(root, "scripts/production/ensure-nginx-websocket-timeouts.sh");
for (let pass = 0; pass < 2; pass += 1) {
	const result = spawnSync("bash", [script], { encoding: "utf8", env: environment });
	assert.equal(result.status, 0, result.stderr);
}
const rendered = fs.readFileSync(config, "utf8");
assert.equal((rendered.match(/Awtsmoos durable WebSocket proxy/g) || []).length, 1);
assert.match(rendered, /proxy_connect_timeout 15s;/);
assert.match(rendered, /proxy_send_timeout 24h;/);
assert.match(rendered, /proxy_read_timeout 24h;/);

fs.rmSync(temporary, { recursive: true, force: true });
console.log(JSON.stringify({
	ok: true,
	suite: "nginx-websocket-timeout-contract",
	idempotent: true
}, null, 2));
