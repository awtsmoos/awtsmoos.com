
// B"H
/**
 * @file BackgroundTester.js
 * @brief Orchestrates hidden simulation and aggregates deep error reports.
 */

import { FileSystemProvider } from '../../../fs-provider.js';
import { HTMLPreviewProcessor } from '../../../html-preview/processor.js';
import { InjectedHomunculus } from './InjectedHomunculus.js';

export const BackgroundTester = {
    async runSimulation(ws, type, absPath, targetUrl, testPlan, tabId) {
        return new Promise(async (resolve) => {
            const logs = [];
            const uniqueTestId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            let timer;
            let resolvedHTML = "";

            if (!targetUrl) {
                const item = { ...ws, path: absPath, kind: 'file', type: type };
                try {
                    const raw = await FileSystemProvider.read(item);
                    resolvedHTML = (raw instanceof Blob) ? await raw.text() : String(raw);
                } catch(e) { return resolve('[SHATTERED] Access error for ' + absPath + ': ' + e.message); }
            }

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.top = '-9000px';
            iframe.dataset.tabId = uniqueTestId;
            document.body.appendChild(iframe);

            const onMsg = (e) => {
                const d = e.data;
                if (!d || d.testId !== uniqueTestId) return;

                if (d.type === 'TEST_COMPLETED') {
                    clearTimeout(timer);
                    window.removeEventListener('message', onMsg);
                    document.body.removeChild(iframe);

                    let summary = 'B"H - SIMULATION TRUTH REVEALED:\n';
                    const intercepted = d.interceptedLogs || [];
                    if (intercepted.length > 0) {
                        summary += '\n--- CRITICAL DIAGNOSTICS ---\n' + intercepted.join('\n') + '\n';
                    }
                    summary += '\n--- EXECUTION ---\n' + d.report.map(r => '[' + r.action + '] ' + (r.success ? 'DONE' : 'FAIL: ' + r.error)).join('\n');
                    summary += '\n\nFINAL STATE:\n' + d.finalDOM;
                    resolve(summary);
                }
            };
            window.addEventListener('message', onMsg);

            if (targetUrl) {
                iframe.src = targetUrl;
                iframe.onload = () => {
                    try {
                        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const hom = frameDoc.createElement('script');
                        hom.textContent = InjectedHomunculus.getScript(uniqueTestId);
                        frameDoc.head.appendChild(hom);
                    } catch (err) {
                        logs.push('[SYSTEM ERROR] Could not inject test harness into ' + targetUrl + ': ' + err.message);
                    }

                    setTimeout(() => {
                        if (iframe.contentWindow) {
                            iframe.contentWindow.postMessage({ type: 'START_TEST_PLAN', testId: uniqueTestId, plan: testPlan }, '*');
                        }
                    }, 500);
                };
            } else {
                const doc = new DOMParser().parseFromString(resolvedHTML, 'text/html');
                const hom = doc.createElement('script');
                hom.textContent = InjectedHomunculus.getScript(uniqueTestId);
                doc.head.insertBefore(hom, doc.head.firstChild);
                
                const item = { ...ws, path: absPath, workspaceId: ws.id, type: type };
                await HTMLPreviewProcessor.orchestrate(item, iframe, doc.documentElement.outerHTML, uniqueTestId);
                
                setTimeout(() => {
                    if (iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'START_TEST_PLAN', testId: uniqueTestId, plan: testPlan }, '*');
                }, 500);
            }

            timer = setTimeout(() => {
                window.removeEventListener('message', onMsg);
                if (document.body.contains(iframe)) document.body.removeChild(iframe);
                resolve('[TIMEOUT] Oracle response reached temporal limit of 15 seconds.');
            }, 15000);
        });
    }
};
