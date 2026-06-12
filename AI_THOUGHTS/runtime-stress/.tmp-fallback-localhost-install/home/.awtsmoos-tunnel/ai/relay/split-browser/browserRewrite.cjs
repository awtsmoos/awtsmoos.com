//B"H

/**
 * B"H — URL rewriting shared by injected browser code and Node tests.
 *
 * The mirrored browser must stay local. Target-origin URLs become localhost
 * paths, localhost URLs stay local, and explicitly different origins travel
 * through `/proxy?u=` for configured generic routing.
 */
function browserRewriteScript(targetOrigin) {
  return `(() => {
    const targetOrigin = ${JSON.stringify(targetOrigin)};
    const toLocal = value => {
      try {
        const url = new URL(value || '/', location.href);
        if (url.origin === location.origin) return url.pathname + url.search + url.hash;
        if (url.origin === targetOrigin) return url.pathname + url.search + url.hash;
        return '/proxy?u=' + encodeURIComponent(url.href);
      } catch { return value; }
    };
    globalThis.__awtsmoosToLocal = toLocal;
    const nativeOpen = window.open?.bind(window);
    window.open = (url, name, features) => nativeOpen ? nativeOpen(toLocal(url || '/'), name || '_blank', features) : null;
    const patchLocationMethod = method => {
      const original = Location.prototype[method];
      if (typeof original !== 'function') return;
      Location.prototype[method] = function(url) { return original.call(this, toLocal(url)); };
    };
    try { patchLocationMethod('assign'); patchLocationMethod('replace'); } catch {}
    const nativePush = history.pushState.bind(history);
    const nativeReplace = history.replaceState.bind(history);
    history.pushState = function(state, title, url) { return nativePush(state, title, url == null ? url : toLocal(url)); };
    history.replaceState = function(state, title, url) { return nativeReplace(state, title, url == null ? url : toLocal(url)); };
    document.addEventListener('click', event => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor) return;
      anchor.setAttribute('href', toLocal(anchor.getAttribute('href')));
    }, true);
    document.addEventListener('submit', event => {
      const form = event.target;
      if (form?.action) form.action = toLocal(form.action);
    }, true);
  })();`;
}

function toLocalForTest(value, { locationOrigin = "http://127.0.0.1:38488", locationHref = "http://127.0.0.1:38488/", targetOrigin = "https://chatgpt.com" } = {}) {
  const url = new URL(value || "/", locationHref);
  if (url.origin === locationOrigin) return url.pathname + url.search + url.hash;
  if (url.origin === targetOrigin) return url.pathname + url.search + url.hash;
  return "/proxy?u=" + encodeURIComponent(url.href);
}

module.exports = { browserRewriteScript, toLocalForTest };
