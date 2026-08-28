// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorGpuFacade.js
 * @description
 * The Awtsmoos lets creators inspect finite GPU capability through normal JavaScript methods while private handles remain unseen;
 * Awtsmoos.com keeps hardware control small and explicit so ordinary animation can continue even when no WebGL context has begun.
 */

/** Ergonomic GPU runtime namespace over canonical Agent commands. */
export class GevurahAnimatorGpuFacade {
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	status() {
		return this.execute('gpu.status');
	}

	capabilities() {
		return this.execute('gpu.capabilities');
	}

	memory() {
		return this.execute('gpu.memory');
	}

	context() {
		return this.execute('gpu.context');
	}

	release() {
		return this.execute('gpu.release');
	}

	/** @param {string} shemMitzvah Command. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: {}
		});
	}
}
