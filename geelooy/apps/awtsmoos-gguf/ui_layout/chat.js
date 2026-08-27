
// B"H
import { el, icon } from './dom.js';

export function buildChat() {
    return el('div', 'view-container hidden', [
        el('div', 'h-full w-full flex relative', [
            
            // MAIN CHAT AREA
            el('div', 'chat-main', [
                // Toolbar (Fixed Header)
                el('div', 'flex-shrink-0 flex justify-between items-center p-3 border-b border-base bg-panel z-20', [
                     el('div', 'flex items-center gap-3', [
                         el('div', 'w-2 h-2 rounded-full bg-surface', '', { id: 'chatOnlineIndicator' }),
                         el('span', 'text-xs font-bold text-muted tracking-wide', 'OFFLINE', { id: 'chatStatusText' })
                     ]),
                     el('div', 'flex gap-1', [
                         el('button', 'btn', [icon('M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'), el('span', 'text-xs', 'Settings')], { id: 'btnToggleSettings', title: 'Settings' }),
                         el('button', 'btn', [icon('M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z'), el('span', 'text-xs', 'Console')], { id: 'btnToggleConsole', title: 'Console' }),
                         el('button', 'btn danger', [icon('M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'), el('span', 'text-xs', 'Reset')], { id: 'btnResetSession', title: 'Reset' })
                     ])
                ]),

                // Settings Modal (Overlay)
                el('div', 'hidden panel absolute right-4 top-14 z-30 w-72 shadow-2xl border-border-highlight', [
                     el('div', 'p-4 flex-col gap-4', [
                         control('Temperature', 'rngTemp', 'valTemp', 0, 2, 0.1, 0.8),
                         control('Top P', 'rngTopP', 'valTopP', 0, 1, 0.05, 0.9),
                         control('Repeat Penalty', 'rngPenalty', 'valPenalty', 1.0, 2.0, 0.05, 1.1),
                         control('Max Tokens', 'rngMaxTok', 'valMaxTok', 64, 8192, 64, 512),
                     ]),
                     el('div', 'p-3 border-t border-base bg-bg-surface grid grid-cols-3 gap-2', [
                         el('button', 'btn col-span-1', 'Export', { id: 'btnExportChat' }),
                         el('button', 'btn col-span-1', 'Import', { id: 'btnImportChat' }),
                         el('button', 'btn col-span-1', 'Copy', { id: 'btnCopyChat' }),
                         el('input', 'hidden', '', { type:'file', id:'importChatInput', accept:'.json' })
                     ])
                ], { id: 'settingsPanel' }),

                // Messages Container (Flex Grow)
                el('div', 'chat-history', '', { id: 'chatHistory' }),

                // Input Area (Flex Static Bottom)
                el('div', 'chat-input-wrapper', [
                    el('div', 'chat-input-container', [
                        el('textarea', '', '', { 
                            id: 'chatInput', 
                            rows: 1, 
                            placeholder: 'Type your message here...'
                        }),
                        el('button', 'btn primary', icon('M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'), { 
                            id: 'btnSend', 
                            style: 'width:36px; height:36px; padding:0; border-radius:8px; flex-shrink:0;' 
                        })
                    ])
                ])
            ]),

            // SIDEBAR CONSOLE
            el('div', 'console-sidebar collapsed', [
                el('div', 'panel-header justify-between bg-black border-b border-border-highlight flex-shrink-0', [
                    el('span', 'text-accent-emerald', 'SYSTEM TERMINAL'),
                    el('button', 'btn', icon('M6 18L18 6M6 6l12 12'), { id: 'btnCloseConsole', style:'padding:4px; border:none; background:transparent;' })
                ]),
                el('div', 'flex-1 overflow-auto bg-black p-2 font-mono text-xs', '', { id: 'engineLog' }),
                el('div', 'p-2 border-t border-border-highlight bg-black flex justify-between gap-2 flex-shrink-0', [
                    el('input', 'bg-bg-surface border-border-base rounded px-2 py-1 text-xs w-full', '', { id: 'logSearch', placeholder: 'Filter logs...' }),
                    el('button', 'btn', 'CLEAR', { id: 'btnClearLog' })
                ])
            ], { id: 'consolePanel' })
        ])
    ], { id: 'viewChat' });
}

function control(label, idRng, idVal, min, max, step, val) {
    return el('div', 'flex-col', [
        el('div', 'flex justify-between text-xs font-semibold text-text-secondary mb-1', [
            el('label', '', label),
            el('span', 'text-accent-blue font-mono', val, { id: idVal })
        ]),
        el('input', '', '', { type: 'range', id: idRng, min, max, step, value: val })
    ]);
}