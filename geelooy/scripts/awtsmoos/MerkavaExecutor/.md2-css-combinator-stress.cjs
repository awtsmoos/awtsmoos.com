//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("assert");
const { encodeMode2JsBinary, runMode2JsBinary } = require("./merkava-binary/Mode2JsBinary.js");
const { SyntheticBrowserRuntime } = require("./merkava-browser/SyntheticBrowserRuntime.js");

(async () => {
	const browser = new SyntheticBrowserRuntime();
	const source = `
		addStyleSheet('section > .direct { color: red; width: 12px; } .direct + .after { color: blue; height: 13px; } div .after { margin: 99px; }');
		let section = document.createElement('section');
		let direct = document.createElement('div');
		direct.classList.add('direct');
		direct.id = 'direct';
		let after = document.createElement('div');
		after.classList.add('after');
		after.id = 'after';
		let nested = document.createElement('div');
		nested.classList.add('direct');
		nested.id = 'nested';
		let wrap = document.createElement('article');
		wrap.appendChild(nested);
		section.appendChild(direct);
		section.appendChild(after);
		section.appendChild(wrap);
		document.body.appendChild(section);
		let directStyle = getComputedStyle(direct);
		let afterStyle = getComputedStyle(after);
		let nestedStyle = getComputedStyle(nested);
		__awtsmoosResult = {
			directColor: directStyle.getPropertyValue('color'),
			directWidth: directStyle.getPropertyValue('width'),
			afterColor: afterStyle.getPropertyValue('color'),
			afterHeight: afterStyle.getPropertyValue('height'),
			afterMargin: afterStyle.getPropertyValue('margin') || '',
			nestedColor: nestedStyle.getPropertyValue('color') || ''
		};
	`;
	const binary = await encodeMode2JsBinary(source);
	const run = runMode2JsBinary(binary, { globals: browser.globals() });
	assert.deepStrictEqual(run.result, {
		directColor: "rgb(255, 0, 0)",
		directWidth: "12px",
		afterColor: "rgb(0, 0, 255)",
		afterHeight: "13px",
		afterMargin: "",
		nestedColor: ""
	});
	console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
