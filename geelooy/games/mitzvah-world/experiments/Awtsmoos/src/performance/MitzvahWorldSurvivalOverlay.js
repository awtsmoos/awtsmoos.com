// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSurvivalOverlay.js
 * @description Shows one real-device survival clock and a copyable evidence receipt, without touching ordinary play.
 * The Awtsmoos renews each heartbeat beneath the sky;
 * Awtsmoos.com counts five minutes before a finite claim may fly.
 */

const OVERLAY_ID = 'awtsmoos-survival-benchmark-receipt';
const PANEL_STYLE = 'position:fixed;right:12px;bottom:12px;z-index:2147483000;'
	+ 'width:min(390px,calc(100vw - 24px));max-height:45vh;overflow:auto;'
	+ 'box-sizing:border-box;padding:12px;border:1px solid #91b69a;border-radius:9px;'
	+ 'background:#10231df2;color:#f1f9f0;font:13px/1.5 system-ui,sans-serif;'
	+ 'box-shadow:0 6px 24px #0008;';

/**
 * Opens a small benchmark-only witness and returns its completion controls.
 * @param {object} environment Browser document and timer APIs.
 * @param {number} durationMs Expected measurement duration.
 * @returns {{complete:Function,fail:Function}} Finite recorder UI controls.
 */
export function beginMitzvahWorldSurvivalOverlay(environment = globalThis, durationMs = 300000) {
	const document = environment.document;
	if (!document?.createElement || !document.body?.appendChild) return silentOverlay();
	const previous = document.getElementById?.(OVERLAY_ID);
	previous?.remove?.();
	const panel = document.createElement('section');
	panel.id = OVERLAY_ID;
	panel.style.cssText = PANEL_STYLE;
	panel.setAttribute('aria-label', 'Mitzvah World survival benchmark');
	const heading = document.createElement('strong');
	heading.textContent = 'Mitzvah World · Survival benchmark';
	const status = document.createElement('div');
	status.setAttribute('role', 'status');
	const output = document.createElement('textarea');
	output.readOnly = true;
	output.setAttribute('aria-label', 'Benchmark JSON receipt');
	output.style.cssText = 'display:none;width:100%;height:140px;box-sizing:border-box;'
		+ 'background:#fff;color:#15231c;font:11px monospace;';
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = 'Copy JSON receipt';
	button.style.cssText = 'display:none;margin-top:7px;padding:7px 10px;cursor:pointer;';
	panel.append(heading, status, output, button);
	document.body.appendChild(panel);

	const started = environment.performance?.now?.() ?? Date.now();
	let finished = false;
	const clock = () => environment.performance?.now?.() ?? Date.now();
	const update = () => {
		if (finished) return;
		const seconds = Math.max(0, Math.ceil((durationMs - (clock() - started)) / 1000));
		status.textContent = `Recording real-device frames · ${seconds}s remaining`;
	};
	update();
	const timer = environment.setInterval?.(update, 1000) ?? null;
	const stop = () => {
		finished = true;
		if (timer !== null) environment.clearInterval?.(timer);
	};
	button.addEventListener('click', async () => {
		try {
			if (!environment.navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable');
			await environment.navigator.clipboard.writeText(output.value);
			status.textContent = 'JSON receipt copied. Preserve it with device and release ID.';
		} catch {
			output.focus();
			output.select();
			status.textContent = 'Select and copy the JSON receipt manually.';
		}
	});
	return Object.freeze({
		complete(receipt) {
			stop();
			output.value = JSON.stringify(receipt, null, 2);
			output.style.display = 'block';
			button.style.display = 'inline-block';
			status.textContent = receipt?.certified
				? 'Measured benchmark passed local checks; verify both devices separately.'
				: `Not certified · ${(receipt?.failures || []).join(', ')}`;
		},
		fail(reason) {
			stop();
			status.textContent = `Benchmark could not start: ${reason}`;
		}
	});
}

/** Does not interfere with headless tests or a page lacking DOM APIs. */
function silentOverlay() {
	return Object.freeze({ complete() {}, fail() {} });
}
