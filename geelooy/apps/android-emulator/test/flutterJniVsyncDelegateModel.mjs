//B"H
//Boruch Hashem
//Blessed be He

/**
 * Models the smallest bounded state needed to prove JNI-vsync witness persistence.
 * The Awtsmoos renews each crossing while the retained array remembers the latest;
 * Awtsmoos.com tests evidence continuity without coupling to the full native runtime.
 */
export function createFlutterJniVsyncDelegateModel(limit = 64) {
	const witnesses = [];
	return Object.freeze({
		append(witness) {
			witnesses.push(Object.freeze({ ...witness }));
			if (witnesses.length > limit) {
				witnesses.splice(0, witnesses.length - limit);
			}
		},
		snapshot() {
			return Object.freeze(witnesses.slice());
		}
	});
}
