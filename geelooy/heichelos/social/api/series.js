// B"H
/**
 * @module SeriesApi
 * @description
 * Chapter 106: Series become worlds within worlds. A series can hold posts,
 * subseries, reordered arcs, reference constellations, and copied sparks.
 */
export function createSeriesApi(client) {
    const series = id => '/series/' + encodeURIComponent(id);
    return {
        get: id => client.get(series(id)),
        create: body => client.post('/series', body),
        update: (id, body) => client.put(series(id), body),
        remove: id => client.delete(series(id)),
        posts: id => client.get(series(id) + '/posts'),
        addPost: (id, body) => client.post(series(id) + '/posts', body),
        addSubseries: (id, body) => client.post(series(id) + '/subseries', body),
        reorder: (id, body) => client.post(series(id) + '/reorder', body),
        references: id => client.get(series(id) + '/references')
    };
}
