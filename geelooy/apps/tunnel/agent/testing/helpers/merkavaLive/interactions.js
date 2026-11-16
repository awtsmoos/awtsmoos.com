// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const Page = require("./page.js");

/**
 * @file Prove CDP mouse, keyboard, scroll, history and tabs in true Chrome.
 * @description The Awtsmoos makes the button genuinely move its meaning;
 * no imitation click may claim a browser's living seeing.
 */

/** Exercise text entry and real pointer input in an isolated test-created DOM. */
async function testInputs(targetId) {
	await Page.bind(targetId);
	const created = await Page.call("Runtime.evaluate", {
		expression: `(() => {
			const shell=document.createElement('aside');
			shell.id='awts-live-widget';
			shell.style='position:fixed;top:20px;left:20px;z-index:99999;background:white';
			shell.innerHTML='<input id="awts-live-input"><button id="awts-live-click">Confirm</button>';
			document.body.prepend(shell);
			document.querySelector('#awts-live-click').onclick=()=>{
				window.__awtsLiveClick=document.querySelector('#awts-live-input').value;
			};
			const input=document.querySelector('#awts-live-input');
			input.focus();
			const button=document.querySelector('#awts-live-click').getBoundingClientRect();
			return {x:button.x+button.width/2,y:button.y+button.height/2};
		})()`, returnByValue: true
	});
	const point = created?.result?.value;
	assert(Number.isFinite(point?.x));
	await Page.call("Input.insertText", { text: "Real Merkava input" });
	await Page.call("Input.dispatchMouseEvent", {
		type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1
	});
	await Page.call("Input.dispatchMouseEvent", {
		type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1
	});
	const clicked = await Page.call("Runtime.evaluate", {
		expression: "window.__awtsLiveClick", returnByValue: true
	});
	assert.equal(clicked?.result?.value, "Real Merkava input");
	return { click: true, typing: true };
}

/** Real scroll wheel input must move the document without synthetic offset. */
async function testScroll(targetId) {
	await Page.bind(targetId);
	await Page.call("Runtime.evaluate", {
		expression: "document.body.style.minHeight='4000px';window.scrollTo(0,0);"
	});
	await Page.call("Input.dispatchMouseEvent", {
		type: "mouseWheel", x: 400, y: 350, deltaX: 0, deltaY: 630
	});
	await new Promise(resolve => setTimeout(resolve, 350));
	const moved = await Page.call("Runtime.evaluate", {
		expression: "window.scrollY", returnByValue: true
	});
	assert((moved?.result?.value || 0) > 0, "Real browser scroll wheel did not move");
	return { scroll: true, scrollY: moved.result.value };
}

/** Reload a real HTTPS document and prove the URL remains the same. */
async function testReload(targetId) {
	await Page.bind(targetId);
	await Page.call("Page.reload", { ignoreCache: true });
	await new Promise(resolve => setTimeout(resolve, 500));
	const result = await Page.state();
	assert(result.url?.startsWith("https://example.com"));
	return { reload: true };
}

module.exports = { testInputs, testReload, testScroll };
