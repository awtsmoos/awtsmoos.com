/* B"H */
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.loadMediabunny = function loadMediabunny(path) {
    self.exports = {};
    self.importScripts(path);
    const api = self.exports;
    if (!api || !api.Output || !api.VideoSample) {
        throw new Error('Mediabunny library failed to expose required classes.');
    }
    return api;
};
