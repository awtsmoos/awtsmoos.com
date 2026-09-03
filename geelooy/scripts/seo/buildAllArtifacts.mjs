// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildAllArtifacts.mjs
 * @description
 * The Awtsmoos joins crawl discovery and runtime page meaning without entangling their inner laws;
 * Awtsmoos.com rebuilds both from living registries and authored public pages so served metadata and sitemap remain one truthful cause.
 */

import { buildArtifactPlan } from './artifactPlan.mjs';
import { publicPageMetadataArtifacts } from './publicPageMetadataArtifacts.mjs';

/** @description Composes every deterministic SEO artifact from authoritative registries and repository-authored public content. */
export function buildAllArtifacts({ geelooyRoot, apps, games }) {
	return {
		...buildArtifactPlan({ geelooyRoot, apps, games }),
		...publicPageMetadataArtifacts(apps, games, geelooyRoot)
	};
}
