/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos lets each source enter through a clear gate; Awtsmoos.com shows one acquisition family at a time without hiding any possibility.
*/
export function sourcesView() {
	return `
		<section id="sourcesSection" class="workspace-page sources-page" data-studio-page="sources" hidden>
			<header class="page-kicker compact-kicker"><div><p class="eyebrow">Input chamber</p><h2>Sources</h2></div><button data-page-target="stage">Return to Stage</button></header>
			<div class="source-deck workspace-deck" data-workspace-deck="sources">
				<nav class="deck-tabs source-tabs" data-deck-tabs><button class="active" data-deck-target="capture">Capture</button><button data-deck-target="audio">Audio</button><button data-deck-target="generated">Generated</button><button data-deck-target="files">Files</button></nav>
				<div class="deck-stack" data-deck-stack>
					<section class="source-card deck-panel active" data-deck-panel="capture"><div class="card-orb">◉</div><p class="eyebrow">Screen + camera</p><h3>Capture the living moment</h3><p>Choose a combined source or a precise video/audio stream.</p><div class="source-toolbar"><button id="addMonitor">Monitor + Audio</button><button id="addDisplay">Tab/Window + Audio</button><button id="addDisplayVideo">Display Video</button><button id="addDisplayAudio">Display Audio</button><button id="addWebcam">Webcam + Mic</button><button id="addWebcamVideo">Webcam Video</button><button id="addMic">Mic Audio</button></div></section>
					<section class="source-card deck-panel" data-deck-panel="audio" hidden><div class="card-orb">〽</div><p class="eyebrow">Sound becomes light</p><h3>Audio visualization</h3><p>Add a classic Stage source or enter the high-performance GPU laboratory.</p><div class="source-toolbar"><button id="addAudioVisualizer">Default Visualizer</button><label>Family <select id="visualizerFamily"></select></label><button id="addVisualizerFamily">Add Family</button><button class="secondary-button" data-page-target="audio">Open Audio Lab</button></div></section>
					<section class="source-card deck-panel" data-deck-panel="generated" hidden><div class="card-orb">◇</div><p class="eyebrow">Procedural + web</p><h3>Generate a world</h3><p>Bring in a drawing surface, browser capture, or embedded experience.</p><div class="source-toolbar"><button id="addCanvas">2D Canvas</button><button id="addBrowser">Browser</button><button id="addIframe">Iframe</button></div><label>Browser URL <input id="iframeUrl" value="https://awtsmoos.com" /></label></section>
					<section class="source-card deck-panel" data-deck-panel="files" hidden><div class="card-orb">▣</div><p class="eyebrow">Local media</p><h3>Open prepared material</h3><p>Images, video, and audio remain local until the browser grants access.</p><div class="source-toolbar"><button id="addImage">Image</button><button id="addVideoFile">Video File</button><button id="addAudioFile">Audio File</button></div><input id="imageFile" type="file" accept="image/*" hidden /><input id="videoFile" type="file" accept="video/*" hidden /><input id="audioFile" type="file" accept="audio/*" hidden /></section>
				</div>
			</div>
		</section>
	`;
}
