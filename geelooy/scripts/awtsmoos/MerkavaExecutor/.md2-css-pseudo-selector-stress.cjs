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
		addStyleSheet('section .target, input:checked { color: gold; width: 31px; } input:focus { background-color: cyan; } input[data-kind="holy"] { height: 17px; }');
		let section = document.createElement('section');
		let span = document.createElement('span');
		span.classList.add('target');
		span.id = 'span';
		let input = document.createElement('input');
		input.id = 'box';
		input.setAttribute('type', 'checkbox');
		input.setAttribute('data-kind', 'holy');
		section.appendChild(span);
		section.appendChild(input);
		document.body.appendChild(section);
		input.click();
		input.focus();
		let spanStyle = getComputedStyle(span);
		let inputStyle = getComputedStyle(input);
		let snapshot = renderWebGLDom();
		__awtsmoosResult = {
			spanColor: spanStyle.getPropertyValue('color'),
			spanWidth: spanStyle.getPropertyValue('width'),
			inputColor: inputStyle.getPropertyValue('color'),
			inputBg: inputStyle.getPropertyValue('background-color'),
			inputHeight: inputStyle.getPropertyValue('height'),
			checked: input.checked,
			paintedGold: snapshot.commands.some(command => command.op === 'paintBox' && command.color === '#ffd700'),
			paintedCyan: snapshot.commands.some(command => command.op === 'paintBox' && command.background === '#00ffff')
		};
	`;
	const binary = await encodeMode2JsBinary(source);
	const run = runMode2JsBinary(binary, { globals: browser.globals() });
	assert.deepStrictEqual(run.result, {
		spanColor: "rgb(255, 215, 0)",
		spanWidth: "31px",
		inputColor: "rgb(255, 215, 0)",
		inputBg: "rgb(0, 255, 255)",
		inputHeight: "17px",
		checked: true,
		paintedGold: true,
		paintedCyan: true
	});
	console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
