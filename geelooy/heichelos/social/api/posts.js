// B"H
/**
 * @module PostsApi
 * @description
 * Chapter 89: A post is a citadel with gates for body, sections, assets,
 * comments, creation, mutation, and removal. Each gate stands alone so tests
 * can strike it independently and prove the route is real.
 */
export function createPostsApi(client) {
    const post = id => '/posts/' + encodeURIComponent(id);
    return {
        get: id => client.get(post(id)),
        sections: id => client.get(post(id) + '/sections'),
        assets: id => client.get(post(id) + '/assets'),
        comments: (id, query) => client.get(withQuery(post(id) + '/comments', query)),
        comment: (id, body) => client.post(post(id) + '/comments', body),
        create: body => client.post('/posts', body),
        update: (id, body) => client.put(post(id), body),
        remove: id => client.delete(post(id))
    };
}

function withQuery(path, query = {}) {
    const entries = Object.entries(query || {}).filter(([, value]) => value !== undefined && value !== null);
    const params = new URLSearchParams(entries);
    return params.size ? path + '?' + params : path;
}
