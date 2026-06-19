// B"H
/**
 * @module CommentsApi
 * @description
 * Chapter 90: The reply is not a footnote; it is a branch of thunder.
 * Comments can be fetched, listed as replies, threaded, created, replied to,
 * updated, removed, and inspected for assets through separate tested gates.
 */
export function createCommentsApi(client) {
    const comment = id => '/comments/' + encodeURIComponent(id);
    return {
        get: id => client.get(comment(id)),
        tree: id => client.get(comment(id) + '/tree'),
        replies: (id, query) => client.get(withQuery(comment(id) + '/replies', query)),
        assets: id => client.get(comment(id) + '/assets'),
        reply: (id, body) => client.post(comment(id) + '/replies', body),
        create: body => client.post('/comments', body),
        update: (id, body) => client.put(comment(id), body),
        remove: id => client.delete(comment(id))
    };
}

function withQuery(path, query = {}) {
    const entries = Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null);
    const params = new URLSearchParams(entries);
    return params.size ? path + '?' + params : path;
}
