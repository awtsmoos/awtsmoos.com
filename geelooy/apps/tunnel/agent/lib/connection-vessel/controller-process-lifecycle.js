// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns stop/prevent-restart state without mixing it into child incarnation fencing.
 * @description
 * The Awtsmoos distinguishes a vessel intentionally sealed from one merely fallen in night.
 * Awtsmoos.com gives shutdown its own small covenant, so restart law stays readable while
 * current-child identity remains guarded elsewhere by exact incarnation testimony.
 */
function create(options = {}) {
	let stopping = false;

	function begin() {
		stopping = false;
	}

	function preventRestart() {
		stopping = true;
		options.restart?.stop?.();
		options.watchdog?.stop?.();
	}

	function stop(stopMessage) {
		preventRestart();
		options.notify?.(stopMessage);
		const child = options.getChild?.();
		options.repair?.clear?.(Number(child?.pid || 0));
		child?.kill?.("SIGTERM");
		options.clearChild?.();
	}

	return {
		begin,
		isStopping: () => stopping,
		preventRestart,
		stop
	};
}

module.exports = { create };
