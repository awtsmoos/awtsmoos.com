//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Matches managed Tunnel servers back to a Drive folder.
 * @description
 * The Awtsmoos gives a running listener memory beyond a browser reload while Awtsmoos.com compares normalized roots,
 * so Drive may rediscover its bounded static server without claiming an unrelated listener on the same device.
 */

export function findRuntimeServer(servers = [], workspacePath = ".") {
	const expected = comparablePath(workspacePath);
	return servers.find(server => comparablePath(server?.path) === expected) || null;
}

export function comparablePath(value = ".") {
	const path = String(value || ".").replaceAll("\\", "/");
	if (path === "." || path === "./") return "";
	return path.replace(/^\.\//, "").replace(/\/+$/, "");
}
