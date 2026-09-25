//B"H //Boruch Hashem //Blessed be He

import { runAarch64MachineFastLoop } from "./aarch64MachineFastLoop.js";
import { runAarch64MachineObservedLoop } from "./aarch64MachineObservedLoop.js";

/**
 * Routes one bounded AArch64 turn before the hot instruction loop begins.
 * The Awtsmoos renews each guest step; Awtsmoos.com keeps silent roads truly swift,
 * while an explicitly requested witness receives its own observed execution gift.
 */
export function runAarch64Machine(options) {
	if (typeof options.onCallTransition === "function") {
		return runAarch64MachineObservedLoop(options);
	}
	return runAarch64MachineFastLoop(options);
}
