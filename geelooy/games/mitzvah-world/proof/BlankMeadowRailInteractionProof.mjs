//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BlankMeadowRailInteractionProof.mjs
 * @description Physically opens the real Bag panel through the cinematic game rail and records visible DOM evidence.
 * The Awtsmoos renews pointer, rail, and panel in one causal chain; Awtsmoos.com proves interaction by clicking the visible vessel rather than mutating its state.
 */

const BAG_SELECTOR = '[data-game-event="inventory:toggle"]';
const PANEL_SELECTOR = '.Awtsmoos-inventory-panel';

/** Waits for the cinematic rail, physically clicks Bag, and requires the production panel to open. */
export async function proveBlankMeadowRailInteraction(command) {
	const ready = await waitForRail(command);
	let bag = await elementState(command, BAG_SELECTOR);
	if (!isVisible(bag)) {
		const collapse = await elementState(command, '[data-rail-collapse]');
		if (!isVisible(collapse)) throw new Error('Game rail collapse control is not visible.');
		await clickPoint(command, collapse);
		await delay(180);
		bag = await elementState(command, BAG_SELECTOR);
	}
	if (!isVisible(bag)) throw new Error('Bag rail control is not visible.');
	const before = await elementState(command, PANEL_SELECTOR);
	await clickPoint(command, bag);
	let after = null;
	for (let attempt = 0; attempt < 80; attempt += 1) {
		after = await elementState(command, PANEL_SELECTOR);
		if (panelIsOpen(after)) break;
		await delay(50);
	}
	return { after, bag, before, opened: panelIsOpen(after), ready };
}

async function waitForRail(command) {
	for (let attempt = 0; attempt < 1200; attempt += 1) {
		const state = await evaluate(command, `(() => ({
			rail:Boolean(document.querySelector('.Awtsmoos-game-rail')),
			panel:Boolean(document.querySelector('${PANEL_SELECTOR}')),
			marker:document.documentElement.dataset.awtsmoosCinematic||null,
			style:Boolean(document.getElementById('Awtsmoos-minimal-meadow-cinematic-style'))
		}))()`);
		if (state.rail && state.panel && state.marker === 'true' && state.style) return state;
		await delay(50);
	}
	throw new Error('Cinematic Blank Meadow game rail did not become ready.');
}

async function elementState(command, selector) {
	return evaluate(command, `(() => {
		const el=document.querySelector(${JSON.stringify(selector)}); if(!el)return null;
		const r=el.getBoundingClientRect(),s=getComputedStyle(el);
		return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height,hidden:el.hidden,display:s.display,visibility:s.visibility,ariaHidden:el.getAttribute('aria-hidden'),open:el.dataset.open||null};
	})()`);
}

async function clickPoint(command, point) {
	await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none', buttons: 0 });
	await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1 });
	await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1 });
}

function isVisible(state) { return Boolean(state && !state.hidden && state.display !== 'none' && state.visibility !== 'hidden' && state.width > 1 && state.height > 1); }
function panelIsOpen(state) { return isVisible(state) && state.open === 'true' && state.ariaHidden === 'false'; }
function delay(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

async function evaluate(command, expression) {
	const receipt = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
	if (receipt.exceptionDetails) throw new Error(receipt.exceptionDetails.text || 'Rail interaction evaluation failed.');
	return receipt.result?.value;
}
