// B"H
/**
 * @file QuotaApp.js
 * @description Quota dashboard app with live provider polling.
 */

import { QuotaPollingService } from '../services/QuotaPollingService.js';

function renderRows(providers = []) {
    if (!providers.length) return '<tr><td colspan="5">No provider keys registered yet.</td></tr>';
    return providers.map((row) => `
        <tr>
            <td>${row.provider}</td>
            <td>${row.statusCode ?? '-'}</td>
            <td>${row.ok ? 'ok' : 'error'}</td>
            <td><code>${JSON.stringify(row.headers || {})}</code></td>
            <td>${row.polledAt || '-'}</td>
        </tr>
    `).join('');
}

export function renderQuotaApp(windowState, container, desktopState, env) {
    const payload = windowState.payload || (windowState.payload = { snapshot: QuotaPollingService.restore() });
    const snapshot = payload.snapshot || { providers: [], updatedAt: null };
    container.innerHTML = `
        <div class="app-toolbar">
            <button class="quota-refresh">Poll Providers</button>
            <span>Updated: ${snapshot.updatedAt || 'never'}</span>
        </div>
        <table class="quota-table">
            <thead><tr><th>Provider</th><th>Status</th><th>Health</th><th>Headers</th><th>Polled At</th></tr></thead>
            <tbody>${renderRows(snapshot.providers)}</tbody>
        </table>
    `;
    container.querySelector('.quota-refresh').onclick = async () => {
        payload.snapshot = await QuotaPollingService.pollAll();
        env.requestRender();
    };
}
