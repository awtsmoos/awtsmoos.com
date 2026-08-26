// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudioResponsiveHarness
 * @description
 * The Awtsmoos renews viewport, sheet, pointer, and canvas before a responsive proof can speak;
 * Awtsmoos.com keeps browser mechanics in one reusable vessel so product assertions stay clear, poetic, and exact.
 */
export class StudioResponsiveHarness {
	constructor(chrome) {
		this.chrome = chrome;
	}

	/** Applies one deterministic desktop or phone viewport through the real browser protocol. */
	viewport(width, height, mobile) {
		return this.chrome.client.send('Emulation.setDeviceMetricsOverride', {
			width,
			height,
			deviceScaleFactor: mobile ? 2 : 1,
			mobile
		});
	}

	/** Waits until Professional Studio and its dynamically installed styles are genuinely active. */
	async waitForStudio() {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			const ready = await this.chrome.client.evaluate(`(() => {
				const card = document.querySelector('.character-lab-card');
				return document.body.classList.contains('aw-professional-studio')
					&& card && getComputedStyle(card).display === 'none';
			})()`);
			if (ready) {
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		throw new Error('Professional Studio or its dynamic styles did not install.');
	}

	/** Removes only sheet transition timing so hidden headless tabs expose their final geometry deterministically. */
	disableSheetMotion() {
		return this.chrome.client.evaluate(`(() => {
			const style = document.createElement('style');
			style.id = 'aw-responsive-smoke-no-motion';
			style.textContent = '.app-sidebar-left,.app-sidebar-right,.app-timeline{transition:none!important;}';
			document.head.appendChild(style);
		})()`);
	}

	/** Clicks one real control and returns the resulting responsive state. */
	clickAndInspect(selector) {
		return this.chrome.client.evaluate(`(() => {
			document.querySelector('${selector}').click();
			const panelState = (element) => ({
				display: getComputedStyle(element).display,
				opacity: Number(getComputedStyle(element).opacity),
				pointerEvents: getComputedStyle(element).pointerEvents
			});
			const canvas = document.querySelector('#character-canvas').getBoundingClientRect();
			return {
				panel: document.body.dataset.awtsmoosPanel,
				width: innerWidth,
				overflow: document.body.scrollWidth > document.body.clientWidth,
				canvasRatio: canvas.width / canvas.height,
				left: panelState(document.querySelector('.app-sidebar-left')),
				right: panelState(document.querySelector('.app-sidebar-right')),
				timeline: panelState(document.querySelector('.app-timeline'))
			};
		})()`);
	}

	/** Reads stable desktop geometry without mutating the project or workspace. */
	inspectDesktop() {
		return this.chrome.client.evaluate(`(() => {
			const canvas = document.querySelector('#character-canvas').getBoundingClientRect();
			const display = (selector) => getComputedStyle(document.querySelector(selector)).display;
			return {
				width: innerWidth,
				leftDisplay: display('#left-sidebar'),
				rightDisplay: display('#right-sidebar'),
				assetCards: document.querySelectorAll('.aw-studio-asset').length,
				transformInputs: document.querySelectorAll('[data-transform-property]').length,
				timelineHeight: document.querySelector('#nle-timeline').getBoundingClientRect().height,
				characterLabDisplay: display('.character-lab-card'),
				canvasRatio: canvas.width / canvas.height
			};
		})()`);
	}
}
