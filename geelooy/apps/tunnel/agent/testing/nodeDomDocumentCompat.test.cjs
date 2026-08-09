// B"H
const assert = require("node:assert/strict");
const { simulateNodeDomRuntime } = require("../tools/fs/nodeDomRuntime/index.js");

(async () => {
	const html = `<main id="shell"><i id="old"></i></main><script>
		shell.insertAdjacentHTML('afterbegin', '<b id="first">first</b>');
		shell.insertAdjacentHTML('beforeend', '<b id="last">last</b>');
		old.insertAdjacentHTML('beforebegin', '<u id="before">before</u>');
		old.insertAdjacentHTML('afterend', '<u id="after">after</u>');
	</script>`;
	const result = await simulateNodeDomRuntime({
		entry: "nested/index.html",
		files: { "nested/index.html": html },
		url: "https://example.test/nested/index.html",
		returnValues: ["document.baseURI", "shell.children.length", "first.textContent", "last.textContent"]
	});
	assert.equal(result.ok, true);
	assert.equal(result.values["document.baseURI"], "https://example.test/nested/index.html");
	assert.equal(result.values["shell.children.length"], 5);
	assert.equal(result.values["first.textContent"], "first");
	assert.equal(result.values["last.textContent"], "last");
	console.log(JSON.stringify({ ok: true, values: result.values }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
