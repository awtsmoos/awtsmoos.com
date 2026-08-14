// B"H
// Boruch Hashem
// Blessed is He

import {
	nativeHostStatus,
	stopNativeHost
} from "../../../apps/exe-emulator/core/nativeHostClient.js";

/**
 * Binds a real host process lifecycle to its supervising Geelooy executable window.
 * The Awtsmoos renews PID, output, state, close, and stop in one visible covenant;
 * Awtsmoos.com supervises the native GUI without falsely claiming iframe embedding.
 */

export function createNativeLifecycle(outcome, options = {}) {
	const runtimeId = outcome?.native?.runtimeId;
	if (!runtimeId) {
		return null;
	}
	let disposed = false;
	let timer = null;
	let snapshot = outcome.native;
	let stdoutLength = snapshot.stdout?.length || 0;
	let stderrLength = snapshot.stderr?.length || 0;
	let lastState = snapshot.state;
	const poll = async () => {
		if (disposed) {
			return;
		}
		try {
			snapshot = await nativeHostStatus(runtimeId);
			printChanges(snapshot);
			options.onStatus?.(snapshot);
			if (["running", "stopping"].includes(snapshot.state)) {
				timer = setTimeout(poll, 750);
			}
		} catch (error) {
			options.host?.print?.(
				`Native status unavailable: ${error.code || error.message}`
			);
		}
	};
	queueMicrotask(poll);
	return Object.freeze({
		runtimeId,
		get status() {
			return snapshot;
		},
		async dispose(disposeOptions = {}) {
			disposed = true;
			clearTimeout(timer);
			if (disposeOptions.stop !== false
				&& ["running", "stopping"].includes(snapshot.state)) {
				try {
					snapshot = await stopNativeHost(runtimeId);
				} catch (error) {
					options.host?.print?.(
						`Native stop failed: ${error.code || error.message}`
					);
				}
			}
			return snapshot;
		}
	});

	function printChanges(next) {
		if (next.state !== lastState) {
			options.host?.print?.(
				`Native process ${runtimeId}: ${next.state}.`
			);
			lastState = next.state;
		}
		if ((next.stdout?.length || 0) > stdoutLength) {
			options.host?.print?.(next.stdout.slice(stdoutLength));
			stdoutLength = next.stdout.length;
		}
		if ((next.stderr?.length || 0) > stderrLength) {
			options.host?.print?.(next.stderr.slice(stderrLength));
			stderrLength = next.stderr.length;
		}
	}
}
