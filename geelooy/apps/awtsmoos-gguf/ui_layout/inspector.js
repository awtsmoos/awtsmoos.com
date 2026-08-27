// B"H
import { el, icon } from './dom.js';

export function buildInspector() {
    return el('div', 'view-container', [
        el('div', '', [ // Grid Wrapper inside container
            // COL 1: Input & Config
            el('div', 'insp-col', [
                
                // File Load
                el('div', 'panel', [
                    el('div', 'panel-header', 'SOURCE FILE'),
                    el('div', 'p-4', [
                        el('div', 'drop-zone', [
                            el('div', 'text-2xl mb-2', '📂'),
                            el('div', '', 'Click to load .GGUF')
                        ], { onclick: "document.getElementById('fileInput').click()" }),
                        el('input', 'hidden', '', { type: 'file', id: 'fileInput', accept: '.gguf' })
                    ])
                ]),

                // Config
                el('div', 'panel flex-1 hidden', [
                    el('div', 'panel-header', 'MODEL CONFIG'),
                    el('div', 'p-2 scroll-container', '', { id: 'configGrid' })
                ], { id: 'modelConfigSection' })
            ]),

            // COL 2: Data Browser (Wide)
            el('div', 'insp-col', [
                // Tabs
                el('div', 'segmented-group mb-2', [
                    el('button', 'btn active', 'METADATA', { id: 'btnShowMeta' }),
                    el('button', 'btn', 'TENSORS', { id: 'btnShowTensors' }),
                    el('button', 'btn', 'VOCAB', { id: 'btnShowVocab' })
                ]),

                // Content Area
                el('div', 'panel flex-1 relative overflow-hidden', [
                    // Metadata View
                    el('div', 'absolute inset-0 overflow-auto p-4', '', { id: 'metadata' }),
                    
                    // Tensor View
                    el('div', 'hidden absolute inset-0 flex flex-col', [
                        el('div', 'flex text-[10px] font-bold text-muted border-b border-base p-2 bg-surface flex-shrink-0', [
                            el('span', 'flex-1', 'NAME'),
                            el('span', 'w-16', 'TYPE'),
                            el('span', 'w-24 text-right', 'DIMS'),
                            el('span', 'w-16 text-right', 'SIZE')
                        ]),
                        el('div', 'flex-1 overflow-auto', '', { id: 'tensorList' }),
                        el('div', 'p-2 text-xs text-muted border-t border-base flex-shrink-0', [
                            'Total Tensors: ', el('span', 'text-primary font-bold', '0', { id: 'tensorTotalCount' })
                        ])
                    ], { id: 'tensorsContainer' }),

                    // Vocab View
                    el('div', 'hidden absolute inset-0 flex flex-col', [
                        el('div', 'p-2 border-b border-base flex gap-2 flex-shrink-0 items-center', [
                            el('input', 'flex-1', '', { id: 'termInput', placeholder: 'Search token...' }),
                            el('button', 'btn primary', 'GO', { id: 'btnSearch' })
                        ]),
                        el('div', 'p-2 border-b border-base flex gap-2 flex-shrink-0 items-center', [
                            el('label', 'text-xs font-mono text-muted', 'OFFSET'),
                            el('input', 'flex-1', '', { type: 'range', id: 'vocabSlider', min: '0', max: '0', value: '0', disabled: true }),
                            el('span', 'text-xs font-mono text-accent-blue w-24 text-right', '0 / 0', {id: 'vocabOffsetLabel'})
                        ]),
                        /* B"H - Added vocab-grid class here explicitly */
                        el('div', 'flex-1 overflow-auto p-1 vocab-grid', '', { id: 'vocabGrid' })
                    ], { id: 'vocabBrowserContainer' })
                ])
            ]),

            // COL 3: Surgery & Logs
            el('div', 'insp-col', '', { id: 'inspectorRightCol' }) // Populated in app_builder
        ], { id: 'viewInspector' })
    ]);
}