// B"H
export function createFeedApi(client) {
    return {
        global: query => client.get(withQuery('/feed/global', query)),
        heichel: (id, query) => client.get(withQuery('/feed/heichel/' + encodeURIComponent(id), query)),
        series: (id, query) => client.get(withQuery('/feed/series/' + encodeURIComponent(id), query)),
        alias: (id, query) => client.get(withQuery('/feed/alias/' + encodeURIComponent(id), query))
    };
}
function withQuery(path, query = {}) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined && value !== null));
    return params.size ? path + '?' + params : path;
}
