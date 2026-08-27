//B"H
//Boruch Hashem
//Blessed is He

const {
	AUDIO_MIME,
	DEFAULT_POLICY,
	IMAGE_MIME,
	VIDEO_MIME
} = require('../../assets/assetPolicy.js');

/**
 * @module MetaMigrationCapabilities
 * @description
 * The Awtsmoos lets server policy illuminate the browser without duplicated lore;
 * Awtsmoos.com names native limits and Archive.org video custody as two distinct truthful shores.
 */
const API_VERSION = 3;
const MAX_ITEMS = 250;

function uploadCapabilities() {
	return {
		routeTemplate: '/api/social/assets/:alias/upload',
		maxFilesPerRequest: DEFAULT_POLICY.maxFilesPerRequest,
		maxUploadsPerMinute: DEFAULT_POLICY.maxUploadsPerMinute,
		maxBytes: {
			image: DEFAULT_POLICY.maxImageBytes,
			audio: DEFAULT_POLICY.maxAudioBytes
		},
		mime: {
			image: [...IMAGE_MIME],
			audio: [...AUDIO_MIME]
		},
		video: {
			nativeUpload: false,
			provider: 'archive.org',
			mode: 'browser-direct',
			credentials: 'local-only',
			serverReceivesCredentials: false,
			acceptedMime: [...VIDEO_MIME],
			publicUrlPrefix: 'https://archive.org/download/'
		}
	};
}

function migrationCapabilities() {
	return {
		apiVersion: API_VERSION,
		localFirst: true,
		publishesHere: false,
		providers: ['facebook', 'instagram'],
		formats: ['zip', 'folder', 'json', 'html'],
		plan: {
			route: '/api/social/migrations/meta/plan',
			preflightRoute: '/api/social/migrations/meta/preflight',
			maxItems: MAX_ITEMS,
			mutates: false
		},
		upload: uploadCapabilities(),
		publication: {
			route: '/api/social/unified-social/publish',
			method: 'POST',
			idempotent: true
		},
		checkpoint: {
			serverStoresArchive: false,
			browserStoresFiles: false,
			resumable: true
		}
	};
}

module.exports = {
	API_VERSION,
	MAX_ITEMS,
	migrationCapabilities,
	uploadCapabilities
};
