// B"H
/**
 * @file ErrorVessel.js
 * @brief Error vessels for the workspace tree.
 */

import { Workspaces } from '../index.js';

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function isRelayError(e) {
    const code = String(e?.code || '');
    const msg = String(e?.message || '');
    return code.startsWith('RELAY_') || msg.includes('RELAY_OFFLINE') || msg.includes('relay server');
}

function isSshCredentialError(e, ws) {
    const code = String(e?.code || '');
    const msg = String(e?.message || e || '').toLowerCase();
    return ws?.type === 'ssh' && (
        code.startsWith('SSH_') ||
        msg.includes('missing credentials') ||
        msg.includes('permission denied') ||
        msg.includes('authentication') ||
        msg.includes('auth') ||
        msg.includes('password') ||
        msg.includes('private key') ||
        msg.includes('host and username')
    );
}

export const ErrorVessel = {
    manifestLockedUI(parentEl, ws) {
        if (!parentEl) return;
        const li = document.createElement('li');
        li.className = 'tree-item error-node';
        li.style.paddingLeft = '15px';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '8px';

        const btn = document.createElement('button');
        btn.className = 'primary-btn';
        btn.style.minHeight = '20px';
        btn.style.fontSize = '11px';
        btn.style.padding = '2px 8px';
        btn.style.borderRadius = '4px';
        btn.textContent = '🔑 Grant Access';

        btn.onclick = async () => {
            btn.textContent = 'Negotiating...';
            try {
                if (ws && ws.handle) {
                    const res = await ws.handle.requestPermission({ mode: 'readwrite' });
                    if (res === 'granted') {
                        ws.isLocked = false;
                        Workspaces.render();
                        return;
                    }
                }
            } catch (e) {
                console.warn('B"H - Permission ritual failed.', e);
            }
            btn.textContent = 'Refused';
        };

        li.appendChild(btn);
        parentEl.appendChild(li);
    },

    manifestSshRecovery(parentEl, error, ws) {
        if (!parentEl) return;

        const li = document.createElement('li');
        li.className = 'tree-item ssh-recovery-node';
        const host = ws?.sshInfo?.host || error?.sshInfo?.host || 'unknown host';
        const user = ws?.sshInfo?.user || error?.sshInfo?.user || 'unknown user';

        li.innerHTML = `
            <div class="ssh-recovery-card">
                <strong>🔐 SSH credentials need renewal</strong>
                <div>The workspace is preserved. Re-enter the password or private key, then the corrected credentials are saved into Settings and the session.</div>
                <div style="margin-top:7px;opacity:.82;">Target: <code>${escapeHtml(user)}@${escapeHtml(host)}</code></div>
                <div style="margin-top:7px;opacity:.72;overflow-wrap:anywhere;">${escapeHtml(error?.message || error || 'Could not authenticate.')}</div>
                <div class="ssh-recovery-actions">
                    <button class="ssh-fix primary-btn">Re-enter credentials</button>
                    <button class="ssh-retry secondary-btn">Retry</button>
                    <button class="ssh-settings secondary-btn">Open Settings</button>
                </div>
            </div>
        `;

        li.querySelector('.ssh-retry')?.addEventListener('click', () => Workspaces.render());
        li.querySelector('.ssh-fix')?.addEventListener('click', async () => {
            const { SSHWorkspace } = await import('../../features/ssh-workspace.js');
            await SSHWorkspace.recoverWorkspace(ws, error);
        });
        li.querySelector('.ssh-settings')?.addEventListener('click', async () => {
            const { SettingsManager } = await import('../../app/settings.js');
            await SettingsManager.show();
        });

        parentEl.appendChild(li);
    },

    manifestRelayOffline(parentEl, error, ws) {
        if (!parentEl) return;
        const relayUrl = error?.relayUrl || ws?.relayUrl || 'http://localhost:3000';

        const li = document.createElement('li');
        li.className = 'tree-item relay-offline-node';
        li.style.padding = '10px 12px';
        li.style.margin = '6px 8px';
        li.style.border = '1px solid rgba(0,246,255,.35)';
        li.style.borderRadius = '10px';
        li.style.background = 'linear-gradient(135deg, rgba(0,246,255,.08), rgba(255,0,255,.08))';
        li.style.color = 'var(--color-text-primary, white)';
        li.style.fontSize = '12px';
        li.style.lineHeight = '1.45';

        li.innerHTML = `
            <div style="font-weight:700;color:var(--neon-cyan,#00f6ff);margin-bottom:4px;">⚡ Relay server is offline</div>
            <div style="opacity:.86;">This workspace needs the small local relay server running before files can be listed.</div>
            <div style="margin-top:6px;opacity:.75;overflow-wrap:anywhere;">Target: <code>${escapeHtml(relayUrl)}</code></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;">
                <button class="relay-retry primary-btn" style="font-size:11px;padding:4px 8px;">Retry</button>
                <button class="relay-download secondary-btn" style="font-size:11px;padding:4px 8px;">Download relay-server.js</button>
                <button class="relay-copy secondary-btn" style="font-size:11px;padding:4px 8px;">Copy server code</button>
            </div>
            <div style="margin-top:8px;opacity:.82;">Run it in the folder you want exposed:</div>
            <pre style="white-space:pre-wrap;background:rgba(0,0,0,.35);border-radius:6px;padding:6px;margin:5px 0 0 0;">node relay-server.js</pre>
        `;

        li.querySelector('.relay-retry')?.addEventListener('click', () => Workspaces.render());
        li.querySelector('.relay-copy')?.addEventListener('click', async () => {
            const { RelayServerCode } = await import('../../features/relay-server-code.js');
            await navigator.clipboard.writeText(RelayServerCode);
        });
        li.querySelector('.relay-download')?.addEventListener('click', async () => {
            const { RelayServerCode } = await import('../../features/relay-server-code.js');
            const blob = new Blob([RelayServerCode], { type: 'text/javascript' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'relay-server.js';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        });

        parentEl.appendChild(li);
    },

    manifestGeneric(parentEl, msgOrError, ws) {
        if (!parentEl) return;
        if (isRelayError(msgOrError)) return this.manifestRelayOffline(parentEl, msgOrError, ws);
        if (isSshCredentialError(msgOrError, ws)) return this.manifestSshRecovery(parentEl, msgOrError, ws);

        const li = document.createElement('li');
        li.className = 'tree-item';
        li.style.color = 'var(--color-accent-danger)';
        li.style.fontSize = '0.8em';
        li.style.paddingLeft = '15px';
        li.textContent = 'Could not load: ' + (msgOrError?.message || String(msgOrError));
        parentEl.appendChild(li);
    }
};
