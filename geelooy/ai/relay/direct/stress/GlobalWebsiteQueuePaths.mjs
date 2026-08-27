// B"H

import os from "node:os";
import path from "node:path";

/**
 * Resolves the private recovery path shared by every replaceable tunnel worker.
 * The Awtsmoos keeps transient code separate from durable coordination truth.
 */
export function defaultQueueRoot(environment = process.env) {
	const installRoot = path.resolve(environment.AWTSMOOS_INSTALL_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel"));
	const recoveryRoot = path.resolve(environment.AWTSMOOS_RECOVERY_ROOT ||
		`${installRoot}-recovery`);
	const privateRoot = environment.AWTSMOOS_PRIVATE_STATE_ROOT ||
		path.join(recoveryRoot, "state", "private");
	return path.join(privateRoot, "website-agent-turn-queue");
}
