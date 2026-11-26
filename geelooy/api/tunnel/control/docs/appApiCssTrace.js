// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos traces every garment to its maker; Awtsmoos.com keeps the tracer one call away for any agent. */
const operations = Object.freeze([
	{
		id: "css.trace", group: "tools", title: "Trace CSS conflicts to their files", method: "POST",
		path: "/css/trace", pathParams: [], queryParams: [],
		bodyParams: ["url", "files", "html", "name"], auth: "login",
		authNote: "Authenticated account via OAuth or API key with the awtsmoos.api scope; browser sessions are not accepted by this gateway.",
		description: "Analyze CSS the way the Awtsmoos CSS conflict tracer does: supply a public page url (served mode: real load order, bundle-expanded) OR virtual files ([{name, content}] CSS pairs from ANY repo or system, analyzed in memory, nothing written to disk) plus optional html ([{name, content}]) for the unstyled-elements leg. Returns conflicts traced to their files (winner and losers per selector+property), shadowed declaration count, zero-win EXTRA-candidate files, per-file stats, and unstyled-element suspects (classes/ids used in HTML that no supplied stylesheet defines). URL mode refuses private/loopback targets; inputs are size-capped (32 files, 256KB each, 1MB total).",
		dispatch: { module: "../core/cssTraceDispatch.js", route: "/css/trace" },
		example: { params: {}, body: { files: [{ name: "a.css", content: ".x { color: red; }" }, { name: "b.css", content: ".x { color: blue; }" }], html: [{ name: "page.html", content: "<div class=\"x y\">hi</div>" }] } }
	}
]);
module.exports = { operations };
