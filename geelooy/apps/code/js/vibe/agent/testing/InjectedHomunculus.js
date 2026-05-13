
// B"H
/**
 * @file InjectedHomunculus.js
 * @brief The Eyes and Hands within the Testing Iframe.
 */

export const InjectedHomunculus = {
    getScript(uniqueTestId) {
        return `
        (function() {
            const TEST_ID = "${uniqueTestId}";
            const testLogs = [];
            const originalConsole = {
                log: console.log.bind(console),
                info: console.info.bind(console),
                warn: console.warn.bind(console),
                error: console.error.bind(console)
            };

            const serialize = (value) => {
                if (value === undefined) return 'undefined';
                if (typeof value === 'string') return value;
                try {
                    return JSON.stringify(value);
                } catch (err) {
                    return String(value);
                }
            };

            ['log', 'info', 'warn', 'error'].forEach((level) => {
                console[level] = (...args) => {
                    testLogs.push(\`[CONSOLE \${level.toUpperCase()}] \${args.map(serialize).join(' ')}\`);
                    originalConsole[level](...args);
                };
            });

            window.addEventListener('error', function(e) {
                if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                    testLogs.push('[ASSET_FAILURE] Failed to load: ' + (e.target.src || e.target.href));
                } else {
                    testLogs.push('[JS_ERROR] ' + e.message + ' at ' + e.filename + ':' + e.lineno);
                }
            }, true);

            window.addEventListener('unhandledrejection', function(e) {
                testLogs.push('[PROMISE_REJECTION] ' + (e.reason?.message || e.reason || 'Void reason'));
            });

            const originalFetch = window.fetch ? window.fetch.bind(window) : null;
            if (originalFetch) {
                window.fetch = async (...args) => {
                    const response = await originalFetch(...args);
                    if (!response.ok) {
                        testLogs.push('[NETWORK ' + response.status + '] ' + (response.url || args[0]));
                    }
                    return response;
                };
            }

            async function waitForElement(selector, timeout) {
                const started = Date.now();
                while (!document.querySelector(selector)) {
                    if (Date.now() - started > timeout) {
                        throw new Error('Timeout waiting for ' + selector);
                    }
                    await new Promise(r => setTimeout(r, 75));
                }
                return document.querySelector(selector);
            }

            async function waitForEvent(eventName, timeout) {
                return new Promise((resolve, reject) => {
                    const timer = setTimeout(() => {
                        window.removeEventListener(eventName, onEvent);
                        reject(new Error('Timeout waiting for event ' + eventName));
                    }, timeout);

                    const onEvent = (event) => {
                        clearTimeout(timer);
                        window.removeEventListener(eventName, onEvent);
                        resolve(event.detail ?? null);
                    };

                    window.addEventListener(eventName, onEvent, { once: true });
                });
            }

            function dispatchTouch(step) {
                const target = step.selector ? document.querySelector(step.selector) : document.elementFromPoint(step.x || 0, step.y || 0);
                if (!target) throw new Error('Touch target not found.');

                const event = new Event(step.touchType || 'touchstart', { bubbles: true, cancelable: true });
                event.clientX = step.x || 0;
                event.clientY = step.y || 0;
                target.dispatchEvent(event);
            }

            async function snapshotPage() {
                const clone = document.documentElement.cloneNode(true);
                const clonedCanvases = clone.querySelectorAll('canvas');
                const liveCanvases = document.querySelectorAll('canvas');
                for (let i = 0; i < clonedCanvases.length; i++) {
                    const source = liveCanvases[i];
                    const target = clonedCanvases[i];
                    if (!source || !target || typeof source.toDataURL !== 'function') continue;
                    const img = document.createElement('img');
                    img.src = source.toDataURL('image/png');
                    img.width = source.width || source.clientWidth || 300;
                    img.height = source.height || source.clientHeight || 150;
                    target.replaceWith(img);
                }

                const width = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0, window.innerWidth);
                const height = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0, window.innerHeight);
                const serialized = new XMLSerializer().serializeToString(clone);
                const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                    '<foreignObject width="100%" height="100%">' + serialized + '</foreignObject></svg>';
                const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
                return encoded;
            }

            window.addEventListener('message', async function(e) {
                if (!(e.data && e.data.type === 'START_TEST_PLAN' && e.data.testId === TEST_ID)) return;

                const plan = e.data.plan || [];
                const report = [];

                for (const step of plan) {
                    let success = true;
                    let error = null;
                    let result = null;

                    try {
                        switch (step.action) {
                            case 'click': {
                                const el = await waitForElement(step.selector, step.timeout || 5000);
                                el.click();
                                break;
                            }
                            case 'type': {
                                const el = await waitForElement(step.selector, step.timeout || 5000);
                                el.focus();
                                el.value = step.text || '';
                                el.dispatchEvent(new Event('input', { bubbles: true }));
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                                break;
                            }
                            case 'keyboard_press': {
                                const target = step.selector ? await waitForElement(step.selector, step.timeout || 5000) : document.activeElement || document.body;
                                const key = step.text || 'Enter';
                                target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
                                target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
                                break;
                            }
                            case 'touch': {
                                dispatchTouch(step);
                                break;
                            }
                            case 'wait': {
                                await new Promise(r => setTimeout(r, step.ms || 1000));
                                break;
                            }
                            case 'wait_for_element': {
                                await waitForElement(step.selector, step.timeout || 5000);
                                break;
                            }
                            case 'await_event': {
                                result = await waitForEvent(step.eventName, step.timeout || 5000);
                                break;
                            }
                            case 'evaluate': {
                                const val = await eval(step.expression);
                                result = (val && typeof val === 'object') ? serialize(val) : val;
                                break;
                            }
                            case 'read_dom': {
                                const el = step.selector ? await waitForElement(step.selector, step.timeout || 5000) : document.body;
                                result = (el?.innerHTML || '').substring(0, 2000);
                                break;
                            }
                            case 'snapshot_canvas': {
                                const canvas = await waitForElement(step.selector || 'canvas', step.timeout || 5000);
                                result = typeof canvas.toDataURL === 'function' ? canvas.toDataURL() : '[Canvas lacks toDataURL]';
                                break;
                            }
                            case 'snapshot_page': {
                                result = await snapshotPage();
                                break;
                            }
                            default:
                                throw new Error('Unknown action: ' + step.action);
                        }
                    } catch (err) {
                        success = false;
                        error = err.message;
                    }

                    report.push({
                        action: step.action,
                        selector: step.selector || null,
                        success,
                        error,
                        result
                    });

                    if (!success && !['evaluate', 'read_dom', 'await_event'].includes(step.action)) {
                        break;
                    }
                }

                const finalDOM = document.body ? document.body.innerHTML.substring(0, 2000) : 'Void';
                window.parent.postMessage({
                    type: 'TEST_COMPLETED',
                    testId: TEST_ID,
                    report,
                    finalDOM,
                    interceptedLogs: testLogs
                }, '*');
            });
        })();
        `;
    }
};
