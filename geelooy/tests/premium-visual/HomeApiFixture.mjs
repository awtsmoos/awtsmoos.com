//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HomeApiFixture
 * @description
 * The unified browser journey loads the real landing page through a static server.
 * Two read-only feed routes return empty success vessels without inventing live data.
 */

function installHomeVisualApiFixture() {
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input, options = {}) => {
		const url = new URL(
			typeof input === 'string' ? input : input.url,
			location.origin
		);
		const isHomeFeed = url.pathname === '/api/social/feed/home';
		const isIkarFeed = url.pathname === '/api/social/heichelos/ikar/series/root/posts/details';
		if (isHomeFeed || isIkarFeed) {
			return new Response(JSON.stringify({ success: [] }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			});
		}
		return originalFetch(input, options);
	};
}

export const HOME_API_FIXTURE_SOURCE = `(${installHomeVisualApiFixture.toString()})()`;

export {
	installHomeVisualApiFixture
};
