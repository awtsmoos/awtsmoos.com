// B"H
/** Chapter 103: Sections split the post into searchable sparks. */
export function createSectionsApi(client) {
    const post = id => '/posts/' + encodeURIComponent(id);
    const section = id => '/sections/' + encodeURIComponent(id);
    return {
        list: postId => client.get(post(postId) + '/sections'),
        get: sectionId => client.get(section(sectionId)),
        create: (postId, body) => client.post(post(postId) + '/sections', body),
        update: (sectionId, body) => client.put(section(sectionId), body),
        remove: sectionId => client.delete(section(sectionId)),
        verseScan: (postId, query) => client.get(withQuery(post(postId) + '/verse-scan', query)),
        sourceScan: (postId, query) => client.get(withQuery(post(postId) + '/source-scan', query))
    };
}

function withQuery(path, query = {}) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value != null));
    return params.size ? path + '?' + params : path;
}
