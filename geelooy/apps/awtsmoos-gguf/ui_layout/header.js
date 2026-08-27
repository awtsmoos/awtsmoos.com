// B"H
import { el, icon } from './dom.js';

export function buildHeader() {
    return el('header', 'flex items-center justify-between p-3 border-b border-base flex-shrink-0', [
        // Brand
        el('div', 'flex items-center gap-4', [
            el('div', 'flex-col justify-center', [
                el('h1', 'text-lg font-bold text-emerald-400 leading-none neon-text', 'B"H ENGINE', { style: 'margin:0;' }),
                el('span', 'text-[10px] text-muted tracking-widest', 'PURE JS • GEMMA 3')
            ])
        ]),

        // Spacer
        el('div', 'flex-1'),

        // Controls
        el('div', 'flex items-center gap-2', [
            
            // Progress
            el('div', 'hidden items-center gap-2 px-3 py-1 bg-surface rounded border border-base', [
                el('div', 'h-1 w-16 bg-surface overflow-hidden rounded', 
                    el('div', 'h-full bg-emerald-500', '', { id: 'progressBar', style: 'width:0%' })
                ),
                el('span', 'text-xs font-mono text-emerald-400', 'Loading...', { id: 'progressText' })
            ], { id: 'loadProgress' }),

            // Turbo
            el('label', 'flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-base rounded bg-surface hover:bg-highlight', [
                el('input', '', '', { type: 'checkbox', id: 'turboToggle' }),
                el('span', 'text-xs font-bold text-muted', 'TURBO')
            ]),

            // Tabs
            el('div', 'flex bg-surface rounded p-0.5 border border-base', [
                el('button', 'btn active', 'INSPECTOR', { id: 'tabMeta', style: 'border:none; margin:0;' }),
                el('button', 'btn', 'CHAT', { id: 'tabChat', disabled: true, style: 'border:none; margin:0;' })
            ]),

            // Info
            el('button', 'btn', icon('M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'), 
               { id: 'btnInfo', title: 'Manual', style: 'padding: 6px;' })
        ])
    ]);
}