//B"H

/**
 * Chapter 17: The Local Vessel Learned The True Shape Of Paths.
 *
 * The browser should feel like it is standing at ChatGPT's path tree: `/`,
 * `/c/...`, `/?_data=...`, and `/backend-api/...` remain normal local paths
 * that the server dynamically maps upstream. Only cross-origin absolute
 * ChatGPT URLs need the `/proxy?u=` escape hatch.
 *
 * @param {string} targetOrigin Real upstream origin.
 * @returns {string} Inline browser script.
 */
function browserShim(targetOrigin) {
  return `(() => {
    const targetOrigin = ${JSON.stringify(targetOrigin)};
    const toLocal = value => {
      try {
        const url = new URL(value || '/', targetOrigin + '/');
        if (url.origin !== targetOrigin) return value;
        return url.pathname + url.search + url.hash;
      } catch { return value; }
    };
    const nativeOpen = window.open?.bind(window);
    window.open = (url, name, features) => nativeOpen ? nativeOpen(toLocal(url || '/'), name, features) : null;
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

module.exports = { browserShim };
