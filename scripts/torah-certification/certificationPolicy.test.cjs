//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { discoveryLinks } = require("./links.cjs");
const { assessResponse } = require("./policy.cjs");
const { orderingIssues, pasukIssues } = require("./structure.cjs");

/**
 * @file Locks the release-facing Torah certification laws with tiny HTML fixtures.
 * @description These tests prove the checker rejects the exact production regressions already
 * observed without depending on the mutable Ikar corpus or a running application server.
 */
test("discovery follows only canonical Ikar fallback links", () => {
	const html = `<li data-heichel-discovery-kind="series"><a href="/heichelos/ikar/series/bereishis">Genesis</a></li>
		<li data-heichel-discovery-kind="series"><a href="https://evil.example/a">Bad</a></li>`;
	const links = discoveryLinks(html, "http://127.0.0.1:18473");
	assert.deepEqual(links, [{
		kind: "series",
		path: "/heichelos/ikar/series/bereishis",
		label: "Genesis"
	}]);
});

test("numeric page ordering rejects lexical regressions", () => {
	const links = [102, 111, 15].map(page => ({ label: `Likkutei Sichos page ${page}` }));
	assert.deepEqual(orderingIssues(links), [
		"navigation_order:Likkutei Sichos page 111=>Likkutei Sichos page 15"
	]);
});

test("nested series reject generic headings and sentinel descriptions", () => {
	const result = assessResponse({
		path: "/heichelos/ikar/series/berakhot",
		status: 200,
		elapsedMs: 20,
		origin: "http://127.0.0.1:18473",
		html: `<h1 id="heichel-boot-title">Ikar</h1>
			<p class="heichel-semantic-description">undefined</p>`
	});
	assert.equal(result.issues.includes("series_heading_generic_ikar"), true);
	assert.equal(result.issues.includes("series_description_sentinel:undefined"), true);
});

test("server-first posts require readable immediate content", () => {
	const missing = assessResponse({
		path: "/heichelos/ikar/series/demo/post/one",
		status: 200,
		elapsedMs: 5,
		origin: "http://127.0.0.1:18473",
		html: "<main>Client shell only</main>"
	});
	assert.equal(missing.issues.includes("server_first_post_missing"), true);
});

test("pasuk identity requires sequential matching coordinates and self links", () => {
	const good = `<section id="pasuk-1" data-awtsmoos-pasuk data-pasuk="1"><a href="#pasuk-1">1</a></section>
		<section id="pasuk-2" data-awtsmoos-pasuk data-pasuk="2"><a href="#pasuk-2">2</a></section>`;
	assert.deepEqual(pasukIssues(good), []);
	const broken = good.replace('data-pasuk="2"', 'data-pasuk="9"');
	assert.equal(pasukIssues(broken).some(issue => issue.startsWith("pasuk_sequence:2")), true);
});
