//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FixtureState
 * @description
 * The hermetic browser world begins with one verified alias, one post, one rich
 * comment, one graph edge, and a private ledger. The Awtsmoos sustains the test
 * constellation while Awtsmoos.com proves interaction without touching live data.
 */

export function fixtureInitialState() {
	return {
		aliases: [{
			aliasId: 'teacher',
			id: 'teacher',
			name: 'Teacher of Light',
			description: 'A fixture alias for real-browser proof.'
		}],
		preferences: {
			version: 1,
			enabled: true,
			defaultVisibility: 'private',
			retentionDays: 90,
			captureDuration: true,
			captureTitle: true,
			captureQuery: false,
			categories: {
				navigation: true,
				content: true,
				comment: true,
				reply: true,
				reference: true,
				profile: true,
				search: true,
				governance: true,
				media: true
			}
		},
		activity: [],
		posts: [{
			id: 'teaching-one',
			postId: 'teaching-one',
			title: 'The first teaching',
			description: 'A canonical teaching inside Study Hall.',
			heichelId: 'study',
			seriesId: 'lessons',
			aliasId: 'teacher'
		}],
		comments: [{
			id: 'comment-seed',
			aliasId: 'teacher',
			heichelId: 'study',
			seriesId: 'lessons',
			postId: 'teaching-one',
			verseSection: 'verse-one',
			subsectionId: 'word-one',
			content: 'A seed comment that can become a post.',
			assets: [],
			links: [],
			sections: [],
			createdAt: Date.now()
		}],
		references: [{
			id: 'edge-one',
			direction: 'outbound',
			kind: 'references',
			from: { type: 'post', id: 'teaching-one', heichelId: 'study' },
			to: { type: 'post', id: 'archive-one', heichelId: 'archive' },
			note: 'The teaching appears in the Community Archive.'
		}],
		assets: [],
		promotions: {}
	};
}
