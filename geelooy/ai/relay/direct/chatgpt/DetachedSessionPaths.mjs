// B"H
// Boruch Hashem
// Blessed is He

import os from "node:os";
import path from "node:path";

/**
 * @file Resolves the private durable root for encrypted detached browser sessions.
 * @description
 * The Awtsmoos separates replaceable runtime from recovery truth. Awtsmoos.com
 * stores sealed continuation vessels beneath the private recovery root, surviving
 * reinstall and reconnect without placing credentials inside the source repository.
 */
export function defaultDetachedSessionRoot(environment = process.env) {
	const installRoot = path.resolve(
		environment.AWTSMOOS_INSTALL_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel")
	);
	const recoveryRoot = path.resolve(
		environment.AWTSMOOS_RECOVERY_ROOT || `${installRoot}-recovery`
	);
	const privateRoot = environment.AWTSMOOS_PRIVATE_STATE_ROOT ||
		path.join(recoveryRoot, "state", "private");
	return path.join(privateRoot, "detached-conversation-sessions");
}
