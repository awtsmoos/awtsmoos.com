/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos lets sound dress itself in rivers, crowns, fountains, and light; Awtsmoos.com gives the current an immersive chamber whose controls appear only when invited.
*/
export function audioLabView() {
	return `
		<section id="audioLabSection" class="workspace-page audio-lab-page" data-studio-page="audio" hidden>
			<header class="page-kicker compact-kicker audio-kicker">
				<div><p class="eyebrow">Realtime GPU field</p><h2>Audio Lab</h2></div>
				<div class="page-actions"><button id="audioLabImmersive" class="secondary-button">Immersive</button><button id="audioLabAddStage">Add to Stage</button><button class="secondary-button" data-page-target="stage">Stage</button></div>
			</header>
			<div class="audio-lab-grid">
				<section class="audio-canvas-card" data-no-swipe>
					<div class="audio-canvas-stack"><canvas id="audioLabCanvas"></canvas><canvas id="audioGlyphCanvas"></canvas></div>
					<div class="audio-mode-badge"><span>Visual language</span><strong id="audioLabModeName">Hebrew River</strong></div>
					<div class="audio-hud"><span id="audioLabStatus">Demo current active</span><span><b id="audioLabFps">0</b> FPS</span><span><b id="audioLabParticles">0</b> particles</span><span><b id="audioLabQuality">100%</b> quality</span></div>
				</section>
				<aside class="audio-control-rack workspace-deck" data-workspace-deck="audioControls" data-no-swipe>
					<nav class="deck-tabs audio-tabs" data-deck-tabs><button class="active" data-deck-target="looks">Looks</button><button data-deck-target="motion">Motion</button><button data-deck-target="input">Input</button></nav>
					<div class="deck-stack" data-deck-stack>
						<section class="deck-panel active" data-deck-panel="looks"><label class="compact-select">Visual language <select id="audioLabPreset"></select></label><div id="audioLabPresetGrid" class="preset-grid"></div></section>
						<section class="deck-panel" data-deck-panel="motion" hidden><div class="motion-grid"><label>Particle density <output id="audioLabDensityValue">72%</output><input id="audioLabDensity" type="range" min="10" max="100" value="72" /></label><label>Sensitivity <output id="audioLabSensitivityValue">1.35</output><input id="audioLabSensitivity" type="range" min="0.35" max="3" step="0.05" value="1.35" /></label><label>River speed <output id="audioLabFlowValue">1.00</output><input id="audioLabFlow" type="range" min="0.2" max="2.4" step="0.05" value="1" /></label><label class="span-all">Hebrew current <input id="audioLabText" dir="rtl" value="אין עוד מלבדו אור חיים אמת שלום" /></label></div></section>
						<section class="deck-panel" data-deck-panel="input" hidden><label>Audio source <select id="audioLabInput"><option value="demo">Procedural demo</option><option value="microphone">Microphone</option></select></label><div class="button-grid"><button id="audioLabDemo" class="secondary-button">Demo Energy</button><button id="audioLabStartMic">Use Microphone</button></div><div class="frequency-meters"><div><span>Bass</span><i id="audioLabBassMeter"></i></div><div><span>Mid</span><i id="audioLabMidMeter"></i></div><div><span>Treble</span><i id="audioLabTrebleMeter"></i></div><div><span>Energy</span><i id="audioLabEnergyMeter"></i></div></div></section>
					</div>
				</aside>
			</div>
		</section>
	`;
}
