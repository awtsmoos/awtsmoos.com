// B"H
/** Chapter 104: References make every post summon its relatives on screen. */
export function createReferencesApi(client) {
    const post = id => '/posts/' + encodeURIComponent(id);
    const ref = id => '/references/' + encodeURIComponent(id);
    return {
        listForPost: postId => client.get(post(postId) + '/references'),
        graphForPost: postId => client.get(post(postId) + '/reference-graph'),
        create: (postId, body) => client.post(post(postId) + '/references', body),
        update: (id, body) => client.put(ref(id), body),
        remove: id => client.delete(ref(id)),
        copyToSeries: (postId, body) => client.post(post(postId) + '/copy-to-series', body),
        remixToSeries: (postId, body) => client.post(post(postId) + '/remix-to-series', body)
    };
}
