/**
 * B"H
 * @module GuardianGate
 * @description
 * Inline commentator gate with count badge, preview intelligence, collapse state,
 * sidebar bridge, and stable accessibility labels. This is the visible doorway
 * to the margin: a quiet black-gold seal that still tells the reader what waits
 * inside when the thread is collapsed.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";

const INLINE_BUTTON_STYLE = [
  'display:flex','align-items:center','gap:12px','width:100%','padding:14px 18px',
  'border-radius:20px','border:1px solid rgba(255,255,255,0.16)',
  'background:linear-gradient(135deg, rgba(30,41,59,.98), rgba(88,28,135,.94))',
  'box-shadow:0 16px 38px rgba(15,23,42,.23)','backdrop-filter:blur(12px)',
  'color:white','font-weight:850','letter-spacing:.01em','cursor:pointer','transition:all .22s ease'
].join(';');

const INLINE_CONTAINER_STYLE = [
  'display:flex','flex-direction:column','gap:14px','margin:18px 0','padding:0',
  'border-radius:24px','background:transparent','border:0'
].join(';');

const INLINE_LIST_STYLE = [
  'display:flex','flex-direction:column','gap:12px','padding-top:2px','visibility:visible'
].join(';');

async function openSidebar(alias) {
    try {
        if (window.openCommentsPanelToAlias) return window.openCommentsPanelToAlias(alias, true, false);
        const { toggleSidebar } = await import("/heichelos/post/logic/listeners.js");
        toggleSidebar(true);
    } catch (error) {
        console.warn("B\"H - [GuardianGate] Sidebar opening failed; inline remains visible.", error);
    }
}

function updateCount(gate) {
    const count = gate.querySelectorAll('.awtsmoos-inline-commentary-root, .inline-comment[data-cid]').length;
    const badge = gate.querySelector('.awtsmoos-inline-trigger-count');
    if (badge) badge.textContent = String(count);
    const noun = count === 1 ? 'insight' : 'insights';
    const sub = gate.querySelector('.awtsmoos-inline-trigger-subtitle');
    if (sub) sub.textContent = `${count} inline ${noun}`;
    const button = gate.querySelector('.awtsmoos-inline-trigger');
    if (button) button.setAttribute('aria-label', `Toggle ${count} inline ${noun} for @${gate.dataset.alias || 'commentator'}`);
    return count;
}

function toggleInlineList(button, gate, list) {
    const isCollapsed = gate.classList.toggle('is-collapsed');
    button.setAttribute('aria-expanded', String(!isCollapsed));
    button.style.opacity = isCollapsed ? '.9' : '1';
    button.style.transform = isCollapsed ? 'scale(.995)' : 'scale(1)';
    if (list) list.style.display = isCollapsed ? 'none' : 'flex';
}

export class GuardianGate {
    static build(alias, verseIdx, subIdx = null) {
        const gate = BlueprintManifestor.manifest({
            tag: 'section',
            attr: {
                class: 'commentator inline-holder awtsmoos-inline-shell',
                'data-alias': alias,
                'data-idx': verseIdx,
                ...(subIdx !== null && subIdx !== undefined ? { 'data-sub': subIdx } : {}),
                style: INLINE_CONTAINER_STYLE,
                role: 'region',
                'aria-label': `Inline commentary by ${alias}`
            },
            children: [
                {
                    tag: 'button',
                    attr: {
                        class: 'inline-summary-btn active awtsmoos-inline-trigger',
                        style: INLINE_BUTTON_STYLE,
                        title: `Toggle inline insights for ${alias}`,
                        type: 'button',
                        'aria-expanded': 'true'
                    },
                    children: [
                        { tag: 'div', attr: { class: 'awtsmoos-inline-trigger-sigil', style: 'display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:999px;background:rgba(255,255,255,.14);font-size:20px;flex:0 0 auto;' }, children: ['✦'] },
                        {
                            tag: 'div',
                            attr: { class: 'awtsmoos-inline-trigger-copy', style: 'display:flex;flex-direction:column;align-items:flex-start;min-width:0;flex:1;' },
                            children: [
                                { tag: 'span', attr: { class: 'awtsmoos-inline-trigger-title', style: 'font-size:15px;text-transform:uppercase;opacity:.78;font-weight:900;letter-spacing:.08em;' }, children: ['Inline commentary'] },
                                { tag: 'span', attr: { class: 'awtsmoos-inline-trigger-subtitle', style: 'font-size:18px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;' }, children: [`@${alias}`] },
                                { tag: 'span', attr: { class: 'awtsmoos-inline-trigger-preview' }, children: ['Preparing a marginal preview…'] },
                                { tag: 'span', attr: { class: 'awtsmoos-inline-trigger-meta' }, children: [`@${alias} · ready`] }
                            ]
                        },
                        { tag: 'span', attr: { class: 'awtsmoos-inline-trigger-count', 'aria-label': 'inline comment count' }, children: ['0'] }
                    ],
                    events: {
                        mouseenter: e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 22px 48px rgba(88,28,135,.28)'; },
                        mouseleave: e => { const g = e.currentTarget.closest('.awtsmoos-inline-shell'); e.currentTarget.style.transform = g?.classList.contains('is-collapsed') ? 'scale(.995)' : 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 16px 38px rgba(15,23,42,.23)'; },
                        keydown: e => {
                            if (e.key !== 'ArrowDown') return;
                            const firstCard = e.currentTarget.closest('.awtsmoos-inline-shell')?.querySelector('.awtsmoos-inline-commentary-root');
                            if (firstCard) {
                                e.preventDefault();
                                firstCard.setAttribute('tabindex', '-1');
                                firstCard.focus({ preventScroll: false });
                            }
                        },
                        click: (e) => {
                            e.stopPropagation();
                            const gate = e.currentTarget.closest('.awtsmoos-inline-shell');
                            const list = gate?.querySelector('.comments-holder-inline');
                            if (gate) toggleInlineList(e.currentTarget, gate, list);
                            openSidebar(alias);
                        }
                    }
                },
                { tag: 'div', attr: { class: 'comments-holder-inline awtsmoos-inline-comments', style: INLINE_LIST_STYLE } }
            ]
        });
        queueMicrotask(() => updateCount(gate));
        return gate;
    }

    static updateCount(gate) {
        return updateCount(gate);
    }
}
