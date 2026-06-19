// B"H
/**
 * @module SocialApi
 * @description
 * Chapter 109: The constellation is gathered into one crown.
 * Feed, profiles, posts, comments, graph, sections, references, media, series,
 * Q&A, and embedded app vessels are exposed through one client.
 */
import { createSocialClient } from './client.js';
import { createFeedApi } from './feed.js';
import { createProfilesApi } from './profiles.js';
import { createPostsApi } from './posts.js';
import { createCommentsApi } from './comments.js';
import { createGraphApi } from './graph.js';
import { createSectionsApi } from './sections.js';
import { createReferencesApi } from './references.js';
import { createMediaApi } from './media.js';
import { createSeriesApi } from './series.js';
import { createQaApi } from './qa.js';
import { createEmbedsApi } from './embeds.js';

export function createSocialApi(options = {}) {
    const client = createSocialClient(options);
    return {
        client,
        feed: createFeedApi(client),
        profiles: createProfilesApi(client),
        posts: createPostsApi(client),
        comments: createCommentsApi(client),
        graph: createGraphApi(client),
        sections: createSectionsApi(client),
        references: createReferencesApi(client),
        media: createMediaApi(client),
        series: createSeriesApi(client),
        qa: createQaApi(client),
        embeds: createEmbedsApi(client)
    };
}
