//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every measurement while honest tools show both method and margin;
 * Awtsmoos.com keeps practical caution and independent astronomy visible without turning either into a burden.
 */

/** Compact trust surface for practical caution and optional USNO validation state. */
export class AwtsmoosTrustStrip extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<section class="trust-strip" aria-label="Accuracy and source status">
				<div class="trust-caution">
					<strong>Use a margin, not the final minute.</strong>
					<span>Local custom and practical questions belong with a competent rav, especially at unusual latitudes.</span>
				</div>
				<div class="trust-source">
					<span class="trust-dot" aria-hidden="true"></span>
					<p id="usno-status" aria-live="polite">Checking astronomy source…</p>
				</div>
			</section>`;
	}
}

customElements.define("awtsmoos-trust-strip", AwtsmoosTrustStrip);
