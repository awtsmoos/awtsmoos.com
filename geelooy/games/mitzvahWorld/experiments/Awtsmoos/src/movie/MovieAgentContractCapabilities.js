// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentContractCapabilities.js
 * @description Publishes JSON-native world generation, remote-texture, editing, media, and text capability metadata.
 * The Awtsmoos is beyond capability and catalog while every finite agent needs an explicit map before action;
 * Awtsmoos.com names shared worlds, real textures, previews, recipes, trims, media, and captions without hidden abstraction.
 */

export function movieAgentAdvancedCapabilities() {
	return {
		agentPlanning: {
			applyPlan: 'Atomically apply an explainable edit plan as one undo step.',
			applyRecipe: 'Compile and atomically apply a declarative movie recipe.',
			generate: 'Compile and apply structured generation-intent JSON.',
			previewPlan: 'Dry-run a plan and return project delta, receipts, warnings, and project.',
			previewRecipe: 'Compile and dry-run a declarative recipe.',
			procedural: 'Compile structured generation-intent JSON into manifest, explanation, world specs, and project.',
			textureCatalog: 'Return shared production remote-texture ids and URLs.',
			world: 'Normalize explicit shared-world JSON without natural-language inference.'
		},
		media: {
			catalog: 'Project.media contains up to 2048 audio, video, image, model, or document items.',
			commands: ['media.add', 'media.update', 'media.relink', 'media.remove', 'media.replaceReferences']
		},
		professionalEdits: {
			commands: ['clip.rippleTrim', 'clip.roll', 'clip.slip', 'clip.slide', 'clip.rateStretch'],
			tools: ['select', 'blade', 'hand', 'zoom', 'ripple', 'roll', 'slip', 'slide', 'rateStretch']
		},
		remoteTextures: {
			catalogMethod: 'agent.textureCatalog',
			productionRoot: 'https://awtsmoos.com/sites/firebase_drive_migration/',
			roles: ['terrain', 'architecture', 'water', 'craft', 'trees', 'botanical']
		},
		text: {
			captionFormats: ['srt', 'vtt'],
			commands: [
				'text.addTitle',
				'text.updateTitle',
				'text.removeTitle',
				'text.addCaption',
				'text.updateCaption',
				'text.removeCaption',
				'text.importCaptions'
			],
			trackTypes: ['title', 'caption']
		},
		worldGeneration: {
			engine: 'mitzvah-world-minimal-meadow',
			input: 'structured-json-only',
			proceduralCore: 'awtsmoos-json-procedural-core',
			stages: ['spec', 'essential', 'package', 'region', 'rich-world', 'atmosphere', 'receipt'],
			worldSpecKind: 'awtsmoos.movie.world-spec'
		}
	};
}
