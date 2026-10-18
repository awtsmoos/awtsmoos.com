// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Production nginx installer for Awtsmoos.com.
 * @description
 * The Awtsmoos joins source and service in one revealed line;
 * this tiny gate gives the atomic installer exact paths and lets validation shine.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { NginxAtomicDeployment } from "./NginxAtomicDeployment.mjs";

const filePath = fileURLToPath(import.meta.url);
const nginxRoot = path.dirname(filePath);
const sourceRoot = path.join(nginxRoot, "awtsmoos.com");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const deployment = new NginxAtomicDeployment({
	sourceMain: path.join(sourceRoot, "awtsmoos.com.conf"),
	sourceSnippets: path.join(sourceRoot, "snippets"),
	targetMain: "/etc/nginx/sites-enabled/awtsmoos.com",
	targetSnippets: "/etc/nginx/awtsmoos.d",
	backupRoot: `/root/awtsmoos-nginx-backups/tracked-${timestamp}`
});

await deployment.deploy();
console.log('B"H tracked Awtsmoos nginx configuration installed and reloaded.');
