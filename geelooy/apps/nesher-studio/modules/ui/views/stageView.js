/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives every layer a measured place around one dominant canvas; Awtsmoos.com reveals one tool deck at a time so creation never becomes a corridor.
*/
export function stageView() {
	return `
		<section id="stageSection" class="workspace-page stage-page" data-studio-page="stage" hidden>
			<header class="page-kicker compact-kicker">
				<div><p class="eyebrow">Live composition</p><h2>Stage</h2></div>
				<div class="page-actions"><button class="secondary-button" data-page-target="sources">Add Source</button><button data-page-target="audio">Audio Lab</button></div>
			</header>
			<div class="stage-workspace">
				<div class="stage-canvas-zone" data-no-swipe>
					<div class="stage-wrap"><canvas id="stage"></canvas></div>
					<div class="stage-hud"><span id="status">Ready.</span><span>Drag · resize · crop · record</span></div>
				</div>
				<aside class="stage-dock workspace-deck" data-workspace-deck="stageTools" data-no-swipe>
					<header class="dock-heading"><div><p class="eyebrow">Selected source</p><h3 id="inspectorName">No source selected</h3></div><p id="inspectorMeta">Select a layer to edit it.</p></header>
					<nav class="deck-tabs stage-tabs" data-deck-tabs>
						<button class="active" data-deck-target="scenes">Scenes</button><button data-deck-target="layers">Layers</button>
						<button data-deck-target="transform">Move</button><button data-deck-target="crop">Crop</button>
						<button data-deck-target="visual">Visual</button><button data-deck-target="output">Output</button>
					</nav>
					<div class="deck-stack" data-deck-stack>
						<section class="deck-panel active" data-deck-panel="scenes">
							<ol id="sceneList" class="compact-list"></ol>
							<div class="list-pager" data-list-pager="sceneList" data-page-size="4"><button data-page-action="previous">←</button><span data-page-label>1 / 1</span><button data-page-action="next">→</button></div>
							<div class="button-grid"><button id="addScene">New Scene</button><button id="duplicateScene">Duplicate</button></div>
						</section>
						<section class="deck-panel" data-deck-panel="layers" hidden>
							<ol id="sourceList" class="compact-list"></ol>
							<div class="list-pager" data-list-pager="sourceList" data-page-size="4"><button data-page-action="previous">←</button><span data-page-label>1 / 1</span><button data-page-action="next">→</button></div>
							<div class="layer-buttons"><button id="layerTop">Top</button><button id="layerUp">Up</button><button id="layerDown">Down</button><button id="layerBottom">Bottom</button><button id="duplicateSource">Duplicate</button><button id="removeSource" class="danger-button">Remove</button></div>
						</section>
						<section class="deck-panel" data-deck-panel="transform" hidden>
							<div id="transformControls" class="tool-panel">
								<div class="tool-pills"><button id="stageToolTransform">Transform</button><button id="stageToolCrop">Crop Tool</button></div>
								<div class="compact-form"><label class="check-row"><input id="sourceLockAspect" type="checkbox" checked /> Keep aspect</label><label>Scale % <input id="sourceScale" type="number" min="5" max="500" value="100" /></label></div>
								<div class="quick-actions"><button id="fitSource">Fit</button><button id="fillSource">Fill</button><button id="centerSource">Center</button><button id="resetTransform">Reset</button></div>
							</div>
						</section>
						<section class="deck-panel" data-deck-panel="crop" hidden>
							<div id="cropControls" class="crop-grid"><label>L <input id="cropLeft" type="number" min="0" max="90" value="0" /></label><label>T <input id="cropTop" type="number" min="0" max="90" value="0" /></label><label>R <input id="cropRight" type="number" min="0" max="90" value="0" /></label><label>B <input id="cropBottom" type="number" min="0" max="90" value="0" /></label><div class="quick-actions span-all"><button id="cropWide">16:9</button><button id="cropVertical">9:16</button><button id="cropSquare">1:1</button><button id="cropCenterSafe">Safe</button><button id="cropClear">Clear</button><button id="cropReset">Reset</button></div></div>
						</section>
						<section class="deck-panel" data-deck-panel="visual" hidden>
							<div id="visualizerControls" class="visualizer-panel" hidden><div class="compact-form"><label>Preset <select id="visualizerPreset"></select></label><label>Input <select id="visualizerInput"></select></label><label>Sensitivity <input id="visualizerSensitivity" type="range" min="0.2" max="4" step="0.05" /></label><label>Bars <input id="visualizerBars" type="number" min="8" max="96" /></label></div><label>Hebrew Text <input id="visualizerText" /></label><label>Custom JS <textarea id="visualizerCustomJs" rows="3"></textarea></label><button id="visualizerReset">Reset Visualizer</button></div>
						</section>
						<section class="deck-panel" data-deck-panel="output" hidden><div id="downloadList" class="download-list"><p>Finished files appear here.</p></div></section>
					</div>
				</aside>
			</div>
		</section>
	`;
}
