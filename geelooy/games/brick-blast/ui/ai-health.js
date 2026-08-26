// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives imagination a gate and measurement a scale, but neither should drown the game in a modal sea;
 * Awtsmoos.com keeps AI generation and health tuning bounded here, preserving every old id so the existing ministers remain free.
 */
export const binahAiHealthMarkup = `
<div id="ai-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content">
		<h3 id="ai-modal-title">Generate Level with AI</h3>
		<div id="ai-key-entry-view">
			<div class="form-group">
				<label id="ai-api-key-label" for="ai-api-key-input">API Key</label>
				<input type="password" id="ai-api-key-input" placeholder="Enter your API Key">
				<a id="ai-key-link" href="#" target="_blank" class="helper-link">Get an API Key</a>
			</div>
			<div class="modal-actions">
				<button id="ai-modal-cancel-key" class="btn btn-secondary">Cancel</button>
				<button id="ai-key-save" class="btn btn-primary">Save</button>
			</div>
		</div>
		<div id="ai-generate-view" style="display: none;">
			<div class="api-key-status">
				<span>API Key is set</span>
				<button id="ai-key-forget" class="btn-link">Forget</button>
			</div>
			<div class="form-group">
				<label for="ai-model-select">Select Model</label>
				<div class="select-wrapper">
					<select id="ai-model-select"></select>
					<div id="ai-model-loader" class="loader" style="display: none;"></div>
				</div>
			</div>
			<div class="form-group">
				<label for="ai-prompt-input">Level Theme or Idea</label>
				<textarea id="ai-prompt-input" rows="3" placeholder="e.g., 'a fortress of ice', 'a smiling face'"></textarea>
			</div>
			<div id="ai-status" class="ai-status"></div>
			<div class="modal-actions">
				<button id="ai-modal-cancel-generate" class="btn btn-secondary">Cancel</button>
				<button id="ai-modal-generate" class="btn btn-primary">Generate</button>
			</div>
		</div>
	</div>
</div>
<div id="health-tuner-modal" class="modal-backdrop" style="display: none;">
	<div class="modal-content">
		<h3>Set Brush Health</h3>
		<div id="health-tuner-display" class="health-tuner-display">10</div>
		<div class="health-tuner-controls">
			<button id="health-tuner-minus" class="btn-icon">-</button>
			<input type="range" id="health-tuner-slider" min="1" max="1000" value="10">
			<button id="health-tuner-plus" class="btn-icon">+</button>
		</div>
		<div class="health-tuner-input-wrapper">
			<input type="number" id="health-tuner-input" min="1" max="99999" value="10">
		</div>
		<div class="modal-actions">
			<button id="health-tuner-cancel" class="btn btn-secondary">Cancel</button>
			<button id="health-tuner-set" class="btn btn-primary">Set</button>
		</div>
	</div>
</div>`;
