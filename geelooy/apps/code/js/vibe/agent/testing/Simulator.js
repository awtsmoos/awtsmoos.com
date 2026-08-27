
// B"H
/**
 * @file Simulator.js
 * @brief The Orchestrator of the Headless Mirror.
 * 
 * THE POEM OF THE TRUE WITNESS:
 * We create an eye in the void to look upon the work!
 * If the URL is provided, we send the eye to the distant server.
 * If the file is provided, we manifest the world around it.
 * But the Homunculus is not just a hand that clicks;
 * It is an ear that listens for the crash, the unhandled promise,
 * the missing file (404), and the syntax error.
 * All these it gathers into the scroll of the Report,
 * So the AI may see the consequences of its own deeds.
 */

import { FileSystemProvider } from '../../../fs-provider.js';
import { HTMLPreviewProcessor } from '../../../html-preview/processor.js';
import { InjectedHomunculus } from './InjectedHomunculus.js';

export const BackgroundTester = {
    /**
     * B"H
     * Runs an HTML file or live URL in a hidden iframe and executes a sequence of physical actions.
     * 
     * @param {Object} ws - The workspace root object.
     * @param {string} type - Local/GitHub type.
     * @param {string|null} absPath - The path to the index.html.
     * @param {string|null} targetUrl - The external URL to hit (localhost etc).
     * @param {Array<Object>} testPlan - The sequence of simulated actions.
     * @param {string|number} tabId - Current session ID for unique tracking.
     * @returns {Promise<string>} The detailed report of the simulation.
     */
    async runSimulation(ws, type, absPath, targetUrl, testPlan, tabId) {
        return new Promise(async (resolve) => {
            const logs = [];
            const uniqueTestId = `test_sim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            let testTimeout;
            let resolvedHTML = "";
            let mode = targetUrl ? 'url' : 'file';

            if (mode === 'file') {
                const htmlItem = { ...ws, path: absPath, kind: 'file', type };
                try {
                    const raw = await FileSystemProvider.read(htmlItem);
                    resolvedHTML = (raw instanceof Blob) ? await raw.text() : String(raw);
                } catch (e) {
                    return resolve(`[Simulation Shattered] Cannot read entry file ${absPath}: ${e.message}`);
                }
            }

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.top = '-9999px'; 
            iframe.style.width = '1920px';
            iframe.style.height = '1080px';
            // Allow everything necessary for a true app to run
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
            iframe.dataset.tabId = uniqueTestId; 
            document.body.appendChild(iframe);

            const messageHandler = (e) => {
                const data = e.data;
                if (!data) return;

                // 1. Capture Universal Console & Network Errors
                if (data.previewTabId === uniqueTestId || data.source === 'html-preview-console') {
                    if (data.type === 'console-log') {
                        const payload = data.payload;
                        if (payload.level === 'error' || payload.level === 'warn') {
                            const strArgs = payload.args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                            logs.push(`[CONSOLE ${payload.level.toUpperCase()}] ${strArgs}`);
                        }
                    } else if (data.type === 'network-log' && data.payload.status >= 400) {
                        logs.push(`[NETWORK ${data.payload.status}] Failed to fetch: ${data.payload.url}`);
                    }
                }

                // 2. Capture the Homunculus Test Completion Report
                if (data.type === 'TEST_COMPLETED' && data.testId === uniqueTestId) {
                    clearTimeout(testTimeout);
                    window.removeEventListener('message', messageHandler);
                    document.body.removeChild(iframe);
                    
                    const report = `
B"H - SIMULATION REPORT FOR ${mode === 'url' ? targetUrl : absPath}
------------------------------------------------
System Errors/Warnings (Crucial for Debugging):
${logs.length > 0 ? logs.join('\n') : 'None detected.'}

Execution Steps:
${data.report.map((r, i) => `${i+1}. [${r.action.toUpperCase()}] ${r.success ? 'SUCCESS' : 'FAILED: ' + r.error} ${r.result ? '-> ' + JSON.stringify(r.result) : ''}`).join('\n')}

Final DOM Extract:
${data.finalDOM}
------------------------------------------------
                    `.trim();

                    resolve(report);
                }
            };
            
            window.addEventListener('message', messageHandler);

            // Manifest the Sandbox 
            if (mode === 'url') {
                // If we are hitting a URL, we cannot easily use the HTMLPreviewProcessor because it rewrites the DOM.
                // We point the iframe src directly to the URL.
                iframe.src = targetUrl;
                
                // Wait for the iframe to load, then manually inject the Homunculus script.
                // Because of cross-origin policies, this will only work if the server allows it
                // OR if it's running in our internal proxy. If it fails, the Homunculus will timeout.
                iframe.onload = () => {
                    try {
                        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const scriptEl = frameDoc.createElement('script');
                        scriptEl.textContent = InjectedHomunculus.getScript(uniqueTestId, true); // True = include global error catchers manually
                        frameDoc.head.appendChild(scriptEl);
                        
                        setTimeout(() => {
                            if (iframe.contentWindow) {
                                iframe.contentWindow.postMessage({ type: 'START_TEST_PLAN', testId: uniqueTestId, plan: testPlan }, '*');
                            }
                        }, 500);
                    } catch(e) {
                        logs.push(`[SYSTEM ERROR] Could not inject Homunculus into ${targetUrl}. Is it blocking cross-origin framing? Error: ${e.message}`);
                        iframe.contentWindow.postMessage({ type: 'TEST_COMPLETED', testId: uniqueTestId, report: [], finalDOM: "Inaccessible due to cross-origin policies." }, '*');
                    }
                };
            } else {
                // We use our robust HTML processor, which inherently injects error catchers and network interceptors!
                const doc = new DOMParser().parseFromString(resolvedHTML, 'text/html');
                const scriptEl = doc.createElement('script');
                // The processor already handles global errors, so we don't need the Homunculus to duplicate them.
                scriptEl.textContent = InjectedHomunculus.getScript(uniqueTestId, false);
                doc.head.insertBefore(scriptEl, doc.head.firstChild);
                
                const virtualItem = { ...ws, path: absPath, workspaceId: ws.id, type };
                await HTMLPreviewProcessor.orchestrate(virtualItem, iframe, doc.documentElement.outerHTML, uniqueTestId);

                setTimeout(() => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'START_TEST_PLAN', testId: uniqueTestId, plan: testPlan }, '*');
                    }
                }, 500);
            }

            // The Failsafe (Tohu)
            testTimeout = setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                if (document.body.contains(iframe)) document.body.removeChild(iframe);
                resolve(`[Simulation Timeout] The test did not complete within 15 seconds. Logs collected: \n${logs.join('\n')}`);
            }, 15000);
        });
    }
};
