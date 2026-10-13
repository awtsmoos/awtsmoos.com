//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file core.mjs
 * @description Names the stable public doors that explain Awtsmoos.com itself.
 * The Awtsmoos needs no introduction, yet a clear doorway helps every seeking soul draw near;
 * these routes keep the site's public purpose simple, truthful, and clear.
 */

export const CORE_PUBLIC_ROUTES = Object.freeze([
	Object.freeze({ canonicalPath: '/' }),
	Object.freeze({ canonicalPath: '/about/' }),
	Object.freeze({ canonicalPath: '/apps/' }),
	Object.freeze({ canonicalPath: '/contact/' }),
	Object.freeze({
		canonicalPath: '/developers/',
		fallbackDescription: 'Public Awtsmoos API documentation for developers and AI agents: post retrieval, series browse, exact Hebrew and semantic search, reverse citations, friendly URLs, OpenAPI spec, and the /api.json agent manifest.',
		fallbackTitle: 'Awtsmoos API Documentation — Developers & AI Agents | Awtsmoos.com'
	}),
	Object.freeze({ canonicalPath: '/docs/' }),
	Object.freeze({ canonicalPath: '/games/' }),
	Object.freeze({ canonicalPath: '/social/' }),
	Object.freeze({
		canonicalPath: '/legal/privacy/',
		fallbackDescription: 'Read the Awtsmoos.com privacy policy and understand how the site handles information and public web experiences.',
		fallbackTitle: 'Privacy Policy | Awtsmoos.com'
	}),
	Object.freeze({
		canonicalPath: '/legal/terms/',
		fallbackDescription: 'Read the Awtsmoos.com terms for using the site, its public tools, creative experiences, and connected services.',
		fallbackTitle: 'Terms | Awtsmoos.com'
	})
]);
