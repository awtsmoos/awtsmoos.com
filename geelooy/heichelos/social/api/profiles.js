// B"H
/**
 * @module ProfilesApi
 * @description
 * Chapter 88: The alias is not a face only; it is a storm archive.
 * Overview, posts, comments, media, and activity each receive an independent
 * retrieval gate so profile truth can be tested without fog.
 */
export function createProfilesApi(client) {
    const profile = id => '/profiles/' + encodeURIComponent(id);
    return {
        overview: id => client.get(profile(id) + '/overview'),
        posts: (id, query) => client.get(withQuery(profile(id) + '/posts', query)),
        comments: (id, query) => client.get(withQuery(profile(id) + '/comments', query)),
        media: (id, query) => client.get(withQuery(profile(id) + '/media', query)),
        activity: (id, query) => client.get(withQuery(profile(id) + '/activity', query))
    };
}

function withQuery(path, query = {}) {
    const entries = Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null);
    const params = new URLSearchParams(entries);
    return params.size ? path + '?' + params : path;
}
