//B"H
//Boruch Hashem
//Blessed is He
/**
	* The Awtsmoos tests the browser vessel and reveals fatal Forge ruptures without hiding their trace;
	* Awtsmoos.com keeps environment testimony and fatal-error rendering together because each names the same boundary.
	*/
export const checkDivineTools = () => {
	try {
		if (!window.Worker) throw new Error("Worker implementation missing in this browser vessel.");
		if (!window.WebAssembly) throw new Error("WebAssembly manifestation missing. The engine cannot compute.");
		if (!window.indexedDB) throw new Error("IndexedDB missing. Cannot sustain memories.");
	} catch (e) {
		shoutError("Incompatible Environment", e);
		throw e;
	}
};

export const shoutError = (message, errorObj = null) => {
	const overlay = document.getElementById('error-overlay');
	const msgEl = document.getElementById('error-message');
	const stackEl = document.getElementById('error-stack');
	if (overlay && msgEl && stackEl) {
		msgEl.textContent = message.toUpperCase();
		stackEl.textContent = `B"H - FATAL EXCEPTION DETECTED\n\nMESSAGE: ${message}\n\nSTACK:\n${errorObj?.stack || errorObj || 'EMPTY_TRACE'}`;
		overlay.classList.remove('hidden');
	}
};
