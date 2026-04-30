
/**
 * B"H
 * @module Bridge
 * @description
 * * Chapter 14: The Ladder to the Heavens
 * This module establishes the 'postMessage' protocols, ensuring every 
 * log entry and every evaluation result ascends from the sandbox to 
 * the Master's vision (the DevTools).
 */

export const BridgeLogic = `
    let lastEvalResult = undefined;
    let selectedPath = null;

    Object.keys(origConsole).forEach(method => {
        console[method] = (...args) => {
            origConsole[method](...args);
            window.parent.postMessage({
                source: 'html-preview-bridge', type: 'console-log',
                previewTabId: window._AWTSMOOS_TAB_ID,
                payload: { level: method, args: args.map(a => safeSerialize(a)), timestamp: Date.now() }
            }, '*');
        };
    });

    window.addEventListener('message', e => {
        const d = e.data;
        if (!d) return;
        if (d.type === 'set-selected-path') {
            selectedPath = d.path;
        } else if (d.source === 'devtools-bridge' && d.type === 'eval-request') {
            window.$_ = lastEvalResult;
            window.$0 = resolvePath(selectedPath); 
            try {
                const res = window.eval(d.code);
                lastEvalResult = res;
                window.parent.postMessage({
                    source: 'html-preview-bridge', type: 'eval-response',
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { id: d.id, result: safeSerialize(res), isError: false }
                }, '*');
            } catch(err) {
                window.parent.postMessage({
                    source: 'html-preview-bridge', type: 'eval-response',
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { id: d.id, result: safeSerialize(err), isError: true }
                }, '*');
            }
        }
    });
`;
