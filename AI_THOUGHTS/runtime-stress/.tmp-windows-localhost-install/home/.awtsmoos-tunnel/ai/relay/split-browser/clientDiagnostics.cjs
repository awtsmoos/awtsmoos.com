//B"H

/**
 * Chapter 20: The Browser Began To Testify.
 *
 * When Remix cries that a route result is missing, the browser itself must
 * testify: every fetch and XHR involving `_data` is logged before and after the
 * request, so the Node terminal and DevTools can be compared without guessing.
 *
 * @returns {string} Inline diagnostics script.
 */
function clientDiagnostics() {
  return `(() => {
    const tag = 'B"H split browser';
    const nativeFetch = window.fetch?.bind(window);
    if (nativeFetch) window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      const interesting = String(url || '').includes('_data=');
      if (interesting) console.log(tag, 'fetch:start', url, init?.method || 'GET');
      const response = await nativeFetch(input, init);
      if (interesting) console.log(tag, 'fetch:done', url, response.status, response.headers.get('content-type'));
      return response;
    };
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__awtsmoosUrl = url;
      this.__awtsmoosMethod = method;
      return open.apply(this, arguments);
    };
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
      if (String(this.__awtsmoosUrl || '').includes('_data=')) {
        console.log(tag, 'xhr:start', this.__awtsmoosUrl, this.__awtsmoosMethod);
        this.addEventListener('loadend', () => console.log(tag, 'xhr:done', this.__awtsmoosUrl, this.status, this.getResponseHeader('content-type')));
      }
      return send.apply(this, arguments);
    };
  })();`;
}

module.exports = { clientDiagnostics };
