// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSearchApiFixture
 * @description
 * Static Chrome receives deterministic read-only social and library responses while
 * all visual code remains the real application code.
 */

function installFixture() {
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input, options = {}) => {
		const url = new URL(
			typeof input === 'string' ? input : input.url,
			location.origin
		);
		const payload = responseForUrl(url);
		if (payload) {
			return new Response(JSON.stringify(payload), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});
		}
		return originalFetch(input, options);
	};

	function responseForUrl(url) {
		if (url.pathname === '/api/social/feed/home') return { success: [] };
		if (url.pathname.includes('/series/root/posts/details')) return { success: [] };
		if (url.pathname === '/api/social/search/library/shards') {
			return {
				success: [{
					id: 'fixture-library',
					title: 'Fixture Living Library',
					count: 1,
					modes: ['text'],
					available: true
				}]
			};
		}
		if (url.pathname === '/api/social/search/library/query') {
			return queryPayload(url);
		}
		return null;
	}

	function queryPayload(url) {
		return {
			success: {
				query: url.searchParams.get('q'),
				mode: 'text',
				engine: 'fixture-text-search',
				message: '1 source segment matched stored text.',
				hits: [{
					rank: 1,
					score: .93,
					percent: 93,
					row: {
						id: 'fixture-source',
						title: 'The chamber of the Kohen Gadol',
						sourceLabel: 'Temple Service',
						displayText: 'The Kohen Gadol entered a chamber prepared for the sacred service.',
						seriesId: 'temple-service',
						postId: 'kohen-gadol-chamber',
						vectorDimensions: 0
					},
					comments: []
				}],
				commentHits: []
			}
		};
	}
}

export const API_FIXTURE_SOURCE = `(${installFixture.toString()})()`;
