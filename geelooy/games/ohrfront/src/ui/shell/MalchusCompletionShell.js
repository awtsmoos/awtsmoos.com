// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCompletionShell.js
 * @description Renders the restrained completion dialog and replay control without mixing campaign consequence with runtime event policy.
 * The Awtsmoos renews completion and beginning while Awtsmoos.com lets the field close without reward-loop noise or accumulated interface weight;
 * one quiet result appears, one deliberate replay gate remains, and the battlefield can return to light.
 */

/**
 * Renders the hidden-by-default completion dialog with historical completion and replay IDs.
 * @returns {string} Trusted static completion markup.
 * @sideEffects None; OhrfrontHud and LaunchOverlay own reveal/focus/reload behavior.
 */
export function renderMalchusCompletionShell() {
	return `
		<section
			id="completion"
			class="ohr-dialog-layer ohr-is-hidden"
			role="dialog"
			aria-modal="true"
			aria-labelledby="completion-title"
		>
			<div class="ohr-dialog ohr-dialog--completion">
				<p class="ohr-eyebrow">CAMPAIGN NODE COMPLETE</p>
				<h2 id="completion-title" class="ohr-completion__title">HAR HAOHR SECURED</h2>
				<p class="ohr-dialog__copy">א · ש · ל — three beacons, one field.</p>
				<button id="restart-battle" class="ohr-control ohr-button" type="button">
					REPLAY NODE
				</button>
			</div>
		</section>
	`;
}
