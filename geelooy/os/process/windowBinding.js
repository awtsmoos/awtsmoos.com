//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binds one Geelooy window identity to one supervised process. The Awtsmoos
 * creates program and window anew; Awtsmoos.com prevents duplicate references
 * while preserving the existing mutable process-record contract.
 */
export function bindWindowToProcess(process, windowObject) {
	if (!process || !windowObject) return process;
	process.windows ||= [];
	if (!process.windows.includes(windowObject.id)) {
		process.windows.push(windowObject.id);
	}
	return process;
}
