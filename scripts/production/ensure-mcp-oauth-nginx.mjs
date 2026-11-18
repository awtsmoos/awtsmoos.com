//B"H
//Boruch Hashem
//Blessed is He

import fs from "node:fs";
import { spawnSync } from "node:child_process";

/**
 * @file Repairs legacy nginx sites so every public MCP/OAuth discovery gate is proxied.
 * @description
 * The Awtsmoos opens measured doors while existing routes keep their shores;
 * Awtsmoos.com gives root and path-aware metadata the same guarded proxy floors.
 * This compatibility helper remains atomic: it writes a complete candidate site,
 * validates nginx, reloads only after success, and restores the whole prior file on failure.
 */

const file = fs.realpathSync(process.argv[2] || "/etc/nginx/sites-enabled/awtsmoos.com");
const before = fs.readFileSync(file, "utf8");
const paths = [
	"/.well-known/oauth-protected-resource",
	"/.well-known/oauth-protected-resource/api/tunnel/control/mcp",
	"/.well-known/oauth-authorization-server",
	"/api/tunnel/control/mcp"
];
let after = before;

for (const route of paths) {
	if (after.includes("location = " + route + " {")) continue;
	const anchor = "\tlocation ^~ /api/ {";
	if (!after.includes(anchor)) throw new Error("Expected API proxy anchor missing.");
	const proxyTarget = route === "/api/tunnel/control/mcp"
		? "http://127.0.0.1:8080/api/tunnel/control/mcp/"
		: "http://127.0.0.1:8080";
	const vessel = [
		"\tlocation = " + route + " {",
		"\t\tproxy_http_version 1.1;",
		"\t\tproxy_set_header Host $host;",
		"\t\tproxy_set_header X-Forwarded-Host $host;",
		"\t\tproxy_set_header X-Forwarded-Proto $scheme;",
		"\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
		"\t\tproxy_pass " + proxyTarget + ";",
		"\t}",
		""
	].join("\n");
	after = after.replace(anchor, vessel + "\n" + anchor);
}

if (after === before) {
	console.log("OAuth nginx routes already present.");
	process.exit(0);
}

const backupRoot = "/var/backups/awtsmoos-mcp";
fs.mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
const backup = backupRoot + "/nginx-site-" + Date.now() + ".conf";
fs.writeFileSync(backup, before, { mode: 0o600 });
const temporary = file + ".mcp-new";
fs.writeFileSync(temporary, after, { mode: fs.statSync(file).mode & 0o777 });

if (fs.readFileSync(file, "utf8") !== before) {
	fs.unlinkSync(temporary);
	throw new Error("Concurrent nginx configuration change.");
}

fs.renameSync(temporary, file);
const run = args => spawnSync("nginx", args, { encoding: "utf8" });
const check = run(["-t"]);
if (check.status !== 0) {
	fs.writeFileSync(temporary, before);
	fs.renameSync(temporary, file);
	throw new Error("nginx validation failed; original restored: " + check.stderr);
}
const reload = run(["-s", "reload"]);
if (reload.status !== 0) {
	fs.writeFileSync(temporary, before);
	fs.renameSync(temporary, file);
	run(["-s", "reload"]);
	throw new Error("nginx reload failed; original restored.");
}
console.log(JSON.stringify({ ok: true, routes: paths, backup }));
