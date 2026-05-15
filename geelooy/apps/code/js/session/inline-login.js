// B"H
import { UI } from '../ui.js';

/**
 * B"H
 * Small inline login helper for editor features that need an Awtsmoos session.
 */
export const InlineLogin = {
    async current() {
        try {
            const res = await fetch('/api/tunnel/control/me', { credentials: 'include' });
            const data = await res.json();
            if (data && data.ok !== false) return { ok: true, identity: data.identity || data.user || data };
            return { ok: false, error: data?.error || 'not_logged_in' };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    },

    async ensure() {
        const got = await this.current();
        if (got.ok) return got;

        const html = `
            <div style="text-align:left; line-height:1.5;">
                <p>Log in to Awtsmoos to activate the Awtsmoos OS workspace.</p>
                <p style="opacity:.8; font-size:.9em;">This keeps the editor open. After login, the workspace automatically refreshes.</p>
                <button id="awtsmoos-inline-login-open" class="primary-btn" style="width:100%; margin-top:8px;">Open Login</button>
            </div>`;

        UI.showDialog({ title: 'Awtsmoos Login Required', contentHTML: html, okText: '', cancelText: 'Close' });
        setTimeout(() => {
            const btn = document.getElementById('awtsmoos-inline-login-open');
            if (btn) btn.onclick = () => {
                const next = encodeURIComponent(location.pathname + location.search + location.hash);
                window.open(`/api/oauth/start?next=${next}`, 'awtsmoosLogin', 'width=520,height=720');
            };
        }, 30);

        for (let i = 0; i < 90; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const again = await this.current();
            if (again.ok) {
                document.getElementById('dialog-cancel-btn')?.click();
                window.dispatchEvent(new CustomEvent('awtsmoos-login-changed', { detail: again.identity }));
                return again;
            }
        }

        return { ok: false, error: 'login_timeout' };
    }
};
