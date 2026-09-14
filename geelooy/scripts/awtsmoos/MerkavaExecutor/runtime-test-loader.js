//B"H
//Boruch Hashem
//Blessed be He

/**
 * Loads the universal runtime-test manifest one repository script at a time.
 * Sequential insertion preserves dependency order while keeping the HTML shell
 * tiny and allowing future engine modules to be inserted without a bundler.
 */
(function loadMerkavaRuntimeTests() {
	const files = globalThis.__MERKAVA_RUNTIME_TEST_SCRIPTS__ || [];
	let index = 0;

	/** Loads the next script only after the current script has executed. */
	function loadNext() {
		if (index >= files.length) {
			return;
		}
		const source = files[index];
		index += 1;
		const script = document.createElement("script");
		script.src = source;
		script.async = false;
		script.onload = loadNext;
		script.onerror = () => reportFailure(source);
		document.body.appendChild(script);
	}

	/** Surfaces a dependency failure directly in the visible harness. */
	function reportFailure(source) {
		const output = document.querySelector("#out");
		if (output) {
			output.textContent = `LOAD FAILURE: ${source}`;
		}
		throw new Error(`Merkava runtime test script failed: ${source}`);
	}

	loadNext();
})();
