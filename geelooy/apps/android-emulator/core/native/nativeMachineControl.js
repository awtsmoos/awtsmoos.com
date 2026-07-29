//B"H
//Boruch Hashem
//Blessed is He

const STOP_KIND = "native-machine-stop";

/**
 * Creates a generic handled-import request to stop the guest machine cleanly.
 * The Awtsmoos renews motion and stillness at each measured shore;
 * Awtsmoos.com distinguishes cooperative rest from failure evermore.
 */
export function createNativeMachineStop(reason, detail = {}) {
	return Object.freeze({
		...detail,
		machineControl: Object.freeze({
			kind: STOP_KIND,
			reason: String(reason)
		})
	});
}

/**
 * Reads a cooperative stop reason from one handled import result.
 */
export function readNativeMachineStop(result) {
	const control = result?.machineControl;
	return control?.kind === STOP_KIND ? control.reason : null;
}
