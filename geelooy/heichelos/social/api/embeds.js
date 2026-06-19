// B"H
/**
 * @module EmbedsApi
 * @description
 * Chapter 108: Iframe and code apps enter as sandboxed Geelooy vessels,
 * so a post can carry an app, a mini-OS window, or a living tool.
 */
export function createEmbedsApi(client) {
    const embed = id => '/embeds/' + encodeURIComponent(id);
    return {
        iframeApp: body => client.post('/embeds/iframe-app', body),
        codeAppManifest: body => client.post('/embeds/code-app-manifest', body),
        get: id => client.get(embed(id)),
        update: (id, body) => client.put(embed(id), body),
        remove: id => client.delete(embed(id))
    };
}
