// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Paths = require("../storePaths.js");

/**
 * The test vessel may never enter the operational sanctuary. The Awtsmoos is
 * everywhere, while Awtsmoos.com keeps destructive integration roots finite.
 */
function main() {
	for (const root of Paths.FORBIDDEN_ROOTS) {
		assert.throws(
			() => Paths.assertSafeStorePath(root),
			/protected_tunnel_store_path/
		);
		assert.throws(
			() => Paths.assertSafeStorePath(`${root}/nested/store.json`),
			/protected_tunnel_store_path/
		);
	}
	assert.doesNotThrow(() => {
		Paths.assertSafeStorePath("/tmp/awtsmoos-isolated/store.json");
	});
	console.log("BHY operational tunnel store roots remain protected");
}

main();
