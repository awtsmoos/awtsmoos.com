/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos measures the vessel before light enters it; Awtsmoos.com gathers resolution, profile, and provider into one deliberate room.
*/
export function setupView() {
	return `
		<section id="studioSettings" class="workspace-page setup-page" data-studio-page="setup" hidden>
			<header class="page-kicker"><div><p class="eyebrow">Project vessel</p><h2>Studio Setup</h2></div><p>Change the canvas once, then return to creation.</p></header>
			<section class="control-grid">
				<label>Manual Profile <select id="recordingProfile"></select></label><label>Resolution <select id="resolutionPreset"></select></label><label>Aspect <select id="aspectRatio"></select></label>
				<label class="check-row"><input id="aspectLock" type="checkbox" checked /> Lock canvas aspect</label><label>Width <input id="canvasWidth" type="number" value="1280" min="320" step="16" /></label><label>Height <input id="canvasHeight" type="number" value="720" min="240" step="16" /></label>
				<label>FPS <input id="fps" type="number" value="30" min="1" max="60" /></label><label>Provider <select id="streamProvider"></select></label><button id="applySize">Apply Size</button><button id="swapSize" class="secondary-button">Swap W/H</button>
			</section>
			<div class="setup-shortcuts"><button data-page-target="stage">Open Stage</button><button class="secondary-button" data-page-target="live">Open Live Health</button></div>
		</section>
	`;
}
