// B"H
/**
 * @module LegacyHeichelosSubmitBridge
 * @description
 * Chapter 611: an old submit river once referenced a bare `curAlias` and could
 * fracture with `ReferenceError`. The living modular submit console already
 * knows how to heal alias state, so this legacy path now becomes only a bridge.
 */
window.curAlias = window.curAlias || localStorage.getItem('lastAliasUsed') || localStorage.getItem('awtsmoos-alias') || '';
window.addEventListener('awtsmoosAliasChange', event => {
    window.curAlias = event?.detail?.id || window.curAlias || '';
    localStorage.setItem('lastAliasUsed', window.curAlias);
});
import('/heichelos/heichel/submit/script.js?v=legacy-safe-006').catch(error => {
    console.error('B"H legacy submit bridge failed:', error);
    const host = document.querySelector('.main, main, body');
    const box = document.createElement('div');
    box.style.cssText = 'margin:1rem;padding:1rem;border-radius:1rem;background:#fff3cd;color:#3a240f;font-weight:800';
    box.textContent = `Submit console failed to load: ${error.message}`;
    host?.prepend(box);
});
