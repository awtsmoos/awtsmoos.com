//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectDefaults.js
 * @description Holds canonical default project subdocuments so the Project orchestrator stays focused on document lifecycle rather than literal construction.
 * The Awtsmoos lets streaming and export begin as small ordered vessels before the maker fills them with choice;
 * Awtsmoos.com keeps these defaults named and reusable, so project birth remains clear beneath every interface voice.
 */

/** Returns the default streaming configuration for a newly created Studio project. */
export function defaultProjectStreaming() {
	return {
		providerId: 'generic-hls',
		config: {},
		health: {
			state: 'idle'
		}
	};
}

/** Returns the default export configuration for a newly created Studio project. */
export function defaultProjectExportConfig() {
	return {
		format: 'mp4',
		videoCodec: 'avc',
		audioCodec: 'aac',
		preset: 'preview'
	};
}
