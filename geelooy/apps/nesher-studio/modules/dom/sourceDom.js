//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceDom.js
* @description Declares stable source-acquisition and layer-control element identities for post-mount DOM resolution.
* The Awtsmoos lets camera, canvas, file, browser, and layer garments receive distinct names without cramped decree;
* Awtsmoos.com keeps the source-control vessel readable so future creative doors may join the same identity tree.
*/
import { mapIds } from './element.js';

const SOURCE_DOM_IDS = [
	'sourceList',
	'addWebcam',
	'addWebcamVideo',
	'addMic',
	'addMonitor',
	'addDisplay',
	'addDisplayVideo',
	'addDisplayAudio',
	'addAudioVisualizer',
	'visualizerFamily',
	'addVisualizerFamily',
	'addCanvas',
	'addIframe',
	'addBrowser',
	'addImage',
	'addVideoFile',
	'addAudioFile',
	'imageFile',
	'videoFile',
	'audioFile',
	'layerUp',
	'layerDown',
	'layerTop',
	'layerBottom',
	'duplicateSource',
	'removeSource'
];

/** Returns current source-control DOM references after the Studio shell has mounted. */
export function sourceDom() {
	return mapIds(SOURCE_DOM_IDS);
}
