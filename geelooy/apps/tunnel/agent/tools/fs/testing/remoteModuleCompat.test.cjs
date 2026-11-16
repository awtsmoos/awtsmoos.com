// B"H

const test = require("node:test");
const assert = require("node:assert/strict");
const { stabilizeRemoteModuleSource } = require("../actionGroups/remoteModuleCompat.js");

function transform(source) {
	return stabilizeRemoteModuleSource(
		source,
		"https://awtsmoos.com/scripts/awtsmoos/MerkavaExecutor/example.js"
	);
}

async function importTransformed(source) {
	delete globalThis.Merkava;
	const dataUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
	try {
		return await import(`${dataUrl}#${Date.now()}-${Math.random()}`);
	} finally {
		delete globalThis.Merkava;
	}
}

for (const quote of ["'", '"']) {
	test(`UMD ${quote} quote dialect selects globalThis`, async () => {
		const source = [
			"(function(root, factory) {",
			`if (typeof module === ${quote}object${quote} && module.exports) module.exports = factory();`,
			"else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory()); }",
			`})(typeof self !== ${quote}undefined${quote} ? self : this, function(){ return { proof: 42 }; });`
		].join("\n");
		const transformed = transform(source);
		assert.match(transformed, /self\s*:\s*globalThis/);
		assert.match(transformed, /if \(false\)/);
		assert.equal((await importTransformed(transformed)).default.proof, 42);
	});
}

test("conditional CommonJS dependency executes the Merkava global branch", () => {
	const transformed = transform(
		'const { matchesNth } = (typeof module === "object" && module.exports ? require("./dep.js") : globalThis.Merkava);'
	);
	assert.match(transformed, /false \? require\("\.\/dep\.js"\) : globalThis\.Merkava/);
	assert.match(transformed, /export default globalThis\.Merkava/);
});

test("UMD require remains visible for dependency discovery", () => {
	const transformed = transform(
		'(function(root,factory){if(typeof module === "object" && module.exports) module.exports=factory(require("./dep.js"));else root.Merkava=factory(root.Merkava);})(typeof self !== "undefined" ? self : this,function(x){return x;});'
	);
	assert.match(transformed, /if\(false\)/);
	assert.match(transformed, /require\("\.\/dep\.js"\)/);
});

test("plain CommonJS object exports become ESM named exports", () => {
	const transformed = transform(
		"const a = 1; const b = 2; const c = 3;\nmodule.exports = { a, b, c };"
	);
	assert.match(transformed, /export \{ a, b, c \};/);
});
