//B"H
//Boruch Hashem
//Blessed is He
/**
	* The Awtsmoos names every living Forge element through one stable lookup covenant;
	* Awtsmoos.com keeps engine, visualizer, and main runtime aligned on the exact historical element keys.
	*/
export const getElements = () => ({
	textInput: document.getElementById('text-input'),
	rawModeToggle: document.getElementById('raw-mode-toggle'),
	convertIpaBtn: document.getElementById('convert-ipa-btn'),
	tokenList: document.getElementById('token-list'),
	generateBtn: document.getElementById('generate-btn'),
	btnText: document.getElementById('btn-text'),
	btnSpinner: document.getElementById('btn-spinner'),
	speedSlider: document.getElementById('speed-slider'),
	speedVal: document.getElementById('speed-val'),
	logs: document.getElementById('logs'),
	statusDot: document.getElementById('status-dot'),
	statusText: document.getElementById('status-text'),
	charCount: document.getElementById('char-count'),
	visualizer: document.getElementById('visualizer'),
	visualizerPlaceholder: document.getElementById('visualizer-placeholder'),
	audioPlayer: document.getElementById('audio-player'),
	downloadBtn: document.getElementById('download-btn'),
	loadProgressFill: document.getElementById('load-progress-fill'),
	loadProgressVal: document.getElementById('load-progress-val'),
	voiceProgressFill: document.getElementById('voice-progress-fill'),
	voiceProgressVal: document.getElementById('voice-progress-val'),
	genProgressFill: document.getElementById('gen-progress-fill'),
	genProgressVal: document.getElementById('gen-progress-val'),

	// New Data Elements
	modelStatus: document.getElementById('model-status'),
	voiceStatus: document.getElementById('voice-status'),
	tokenizerStatus: document.getElementById('tokenizer-status'),
	purgeBtn: document.getElementById('purge-btn')
});
