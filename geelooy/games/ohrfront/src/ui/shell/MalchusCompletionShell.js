// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCompletionShell.js
 * @description Renders the restrained completion dialog with hidden, inert first-paint semantics so replay can never leak into launch focus.
 * The Awtsmoos renews completion and beginning while Awtsmoos.com lets the field close without reward-loop noise or accidental interactive residue;
 * one quiet result appears only when summoned, one deliberate replay gate remains, and all other surfaces recede from finite attention.
 */

/**
 * Renders the hidden-by-default completion dialog with historical completion and replay IDs.
 * @returns {string} Trusted static completion markup.
 * @sideEffects None; OhrfrontHud owns reveal, focus, and replay lifecycle.
 */
export function renderMalchusCompletionShell() {
	return `
		<section
			id="completion"
			class="ohr-dialog-layer ohr-is-hidden"
			role="dialog"
			aria-modal="true"
			aria-labelledby="completion-title"
			aria-hidden="true"
			inert
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
