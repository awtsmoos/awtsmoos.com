// B"H
/**
 * @module GraphApi
 * @description
 * Chapter 91: The hidden city receives public gates.
 * Graph, timeline, discovery, notifications, and activity can now be fetched
 * as first-class API surfaces and verified as independent actions.
 */
export function createGraphApi(client) {
    return {
        overview: query => client.get(withQuery('/graph', query)),
        timeline: query => client.get(withQuery('/timeline', query)),
        discovery: query => client.get(withQuery('/discovery', query)),
        notifications: query => client.get(withQuery('/notifications', query)),
        activity: query => client.get(withQuery('/activity', query))
    };
}

function withQuery(path, query = {}) {
    const entries = Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null);
    const params = new URLSearchParams(entries);
    return params.size ? path + '?' + params : path;
}
