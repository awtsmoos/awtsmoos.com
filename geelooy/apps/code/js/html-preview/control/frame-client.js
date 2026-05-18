// B\"H

function saveEval(code) {
    return (0, eval)(code);
}

function snapshot() {
    return {
        title: document.title,
        url: location.href,
        html: document.documentElement?.outerHTML || '',
        text: document.body?.innerText || ''
    };
}

async function waitForSelector(selector, timeoutMs = 2000) {
    const start = Date.now();
    return new Promise(resolve => {
        const tick = () => {
            const el = document.querySelector(selector);
            if (el) return resolve({ ok: true, exists: true, selector });
            if (Date.now() - start > timeoutMs) return resolve({ ok: false, exists: false, selector });
            setTimeout(tick, 50);
        };
        tick();
    });
}

const handlers = {
    navigate(p) { location.href = p.url || '/'; return { ok: true }; },
    reload() { location.reload(); return { ok: true }; },
    hardReset() { localStorage.clear(); sessionStorage.clear(); location.reload(); return { ok: true }; },
    waitForSelector(p) { return waitForSelector(p.selector, p.timeoutMs); },
    query(p) { const el = document.querySelector(p.selector); return { ok: true, exists: !!el, text: el?.innerText || '', html: el?.outerHTML || '' }; },
    queryAll(p) { return { ok: true, items: Array.from(document.querySelectorAll(p.selector)).map(el => ({ text: el.innerText, html: el.outerHTML })) }; },
    click(p) { document.querySelector(p.selector)?.click(); return { ok: true }; },
    type(p) { const el = document.querySelector(p.selector); if (el) { el.focus(); el.value = p.text || ''; el.dispatchEvent(new Event('input', { bubbles: true })); } return { ok: true, exists: !!el }; },
    eval(p) { return { ok: true, value: saveEval(p.expression || p.code || '') }; },
    runScript(p) { return handlers.eval(p); },
    snapshot() { return { ok: true, ...snapshot() }; },
    consoleLogs() { return { ok: true, logs: window.__previewLogs || [] }; },
    storage(p) { const store = p.session ? sessionStorage : localStorage; return { ok: true, value: store.getItem(p.key) }; },
    storageSet(p) { const store = p.session ? sessionStorage : localStorage; store.setItem(p.key, p.value); return { ok: true }; },
    storageDelete(p) { const store = p.session ? sessionStorage : localStorage; store.removeItem(p.key); return { ok: true }; }
};

['log','warn','error'].forEach(method => {
    const old = console[method].bind(console);
    console[method] = (...args) => { window.__previewLogs = window.__previewLogs || []; window.__previewLogs.push({ method, args, at: Date.now() }); old(...args); };
});

window.addEventListener('message', async event => {
    const d = event.data;
    if (!d || d.source !== 'preview-control-parent') return;
    try {
        const fn = handlers[d.action];
        const result = fn ? await fn(d.payload || {}) : { ok: false, error: 'unsupported_action', action: d.action };
        event.source?.postMessage({ source: 'preview-control-frame', id: d.id, result }, '*');
    } catch (e) {
        event.source?.postMessage({ source: 'preview-control-frame', id: d.id, result: { ok: false, error: e.message } }, '*');
    }
});
