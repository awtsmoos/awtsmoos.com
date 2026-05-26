//B"H

/**
 * B"H — Gentle login awakener for the mirrored ChatGPT page.
 *
 * Once the page is loaded and quiet, this looks for common login/sign-in
 * controls and clicks exactly once per tab session. Any popup opened by the
 * site has already been patched by the browser rewrite layer, so it stays inside
 * localhost/proxy routing instead of escaping the split-browser vessel.
 */
function autoLoginScript() {
  return `(() => {
    const flag = 'awtsmoosAutoLoginClicked.v1';
    if (sessionStorage.getItem(flag)) return;
    const words = /^(log in|login|sign in|signin|continue with google|continue)$/i;
    const visible = el => {
      const box = el.getBoundingClientRect?.();
      const style = getComputedStyle(el);
      return box && box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const label = el => [el.textContent, el.getAttribute?.('aria-label'), el.getAttribute?.('title'), el.value].filter(Boolean).join(' ').trim();
    const findLogin = () => [...document.querySelectorAll('a,button,[role="button"],input[type="button"],input[type="submit"]')]
      .find(el => visible(el) && words.test(label(el).replace(/\\s+/g, ' ').trim()));
    const attempt = () => {
      if (sessionStorage.getItem(flag)) return;
      const el = findLogin();
      if (!el) return;
      sessionStorage.setItem(flag, '1');
      el.click();
      try { console.info('B"H split auto-login clicked', label(el)); } catch {}
    };
    const schedule = () => setTimeout(attempt, 900);
    if (document.readyState === 'complete') schedule();
    else addEventListener('load', schedule, { once: true });
    setTimeout(attempt, 2500);
    setTimeout(attempt, 5000);
  })();\n`;
}

module.exports = { autoLoginScript };
