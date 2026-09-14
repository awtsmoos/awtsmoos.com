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
		addStyleSheet('div { width: 10px; height: 11px; background-color: red; color: black; padding: 1px; } .card { width: 20px; margin: 3px; } #hero { background-color: blue; border-width: 2px; }');
		let element = document.createElement('div');
		element.id = 'hero';
		element.classList.add('card');
		element.textContent = 'CSS';
		document.body.appendChild(element);
		let style = getComputedStyle(element);
		let snapshot = renderWebGLDom();
		let heroPaint = snapshot.commands.filter(command => command.op === 'paintBox' && command.background === '#0000ff').pop();
		__awtsmoosResult = {
			width: style.getPropertyValue('width'),
			background: style.getPropertyValue('background-color'),
			color: style.getPropertyValue('color'),
			margin: style.getPropertyValue('margin'),
			padding: style.getPropertyValue('padding'),
			border: style.getPropertyValue('border-width'),
			paintedWidth: heroPaint.width,
			paintedBackground: heroPaint.background,
			paintedPadding: heroPaint.padding,
			paintedBorder: heroPaint.border,
			hasText: snapshot.commands.some(command => command.op === 'paintTextPlaceholder' && command.text === 'CSS')
		};
	`;
	const binary = await encodeMode2JsBinary(source);
	const run = runMode2JsBinary(binary, { globals: browser.globals() });
	assert.deepStrictEqual(run.result, {
		width: "20px",
		background: "rgb(0, 0, 255)",
		color: "rgb(0, 0, 0)",
		margin: "3px",
		padding: "1px",
		border: "2px",
		paintedWidth: 26,
		paintedBackground: "#0000ff",
		paintedPadding: 1,
		paintedBorder: 2,
		hasText: true
	});
	console.log(JSON.stringify({ ok: true, bytes: binary.length, result: run.result }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
