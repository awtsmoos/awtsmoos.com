// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures purchase, knowledge, debt, and error without confusing one vessel for another;
 * Awtsmoos.com keeps commerce and consequence modular, so the player can understand the choice before pressing further.
 */
export const yesodCommerceMarkup = `
<div id="purchase-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content">
		<h3 id="purchase-modal-title">Purchase Item</h3>
		<p id="purchase-modal-desc"></p>
		<div id="purchase-modal-display" class="purchase-tuner-display">1</div>
		<div class="purchase-tuner-controls">
			<button id="purchase-tuner-minus" class="btn-icon">-</button>
			<input type="range" id="purchase-tuner-slider" min="1" max="100" value="1">
			<button id="purchase-tuner-plus" class="btn-icon">+</button>
		</div>
		<div class="purchase-tuner-input-wrapper">
			<input type="number" id="purchase-tuner-input" min="1" max="100" value="1">
		</div>
		<div id="purchase-modal-cost" class="purchase-tuner-cost">Cost: 0 ¤</div>
		<div class="modal-actions">
			<button id="purchase-tuner-cancel" class="btn btn-secondary">Cancel</button>
			<button id="purchase-tuner-buy" class="btn btn-primary">Buy</button>
		</div>
	</div>
</div>
<div id="info-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content info-content">
		<div class="info-header">
			<h3 id="info-modal-title">Divine Knowledge</h3>
			<div id="info-modal-icon" class="info-icon-large"></div>
		</div>
		<div id="info-modal-body" class="info-body"></div>
		<div class="modal-actions">
			<button id="info-modal-close" class="btn btn-primary">Understand</button>
		</div>
	</div>
</div>
<div id="debt-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content debt-content">
		<h3 style="color: var(--danger);">The Celestial Debt Collector</h3>
		<p>
			Your spiritual debt is overwhelming
			(<span id="debt-amount" style="color: var(--danger); font-weight: bold;"></span> ¤).
			You cannot proceed until you liquidate your assets.
		</p>
		<p style="font-size: 0.8rem; margin-bottom: 1rem;">Sell your upgrades at 50% value to pay off your debt.</p>
		<div id="debt-assets-list" class="debt-assets-list"></div>
		<div class="modal-actions">
			<button id="debt-continue-button" class="btn btn-primary" disabled>Settle Debt</button>
		</div>
	</div>
</div>
<div id="error-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content">
		<h3 id="error-modal-title">An Error Occurred</h3>
		<p id="error-modal-message"></p>
		<div class="error-details">
			<h4>Troubleshooting Details:</h4>
			<pre id="error-modal-details"></pre>
		</div>
		<div class="modal-actions">
			<button id="error-modal-close" class="btn btn-primary">Close</button>
		</div>
	</div>
</div>`;
