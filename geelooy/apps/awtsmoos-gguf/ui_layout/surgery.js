// B"H
import { el, icon } from './dom.js';

const DEFAULT_KEEP_REGEX = `^[\\s\\p{P}\\p{N}\\p{S}\\p{L}a-zA-Z\\u0590-\\u05FF\\u2581]+$`;

export function buildSurgeryPanel() {
    return el('div', 'panel hidden border-red-900', [
        el('div', 'panel-header text-red-400', 'DIVINE SURGERY'),
        el('div', 'p-3 flex-col gap-4', [
            // Layers
            el('div', 'flex-col', [
                control('KEEP START', 'rngKeepStart', 'valKeepStart', 0, 100, 0, '', 'Number of layers to keep from the beginning.'),
                control('KEEP END', 'rngKeepEnd', 'valKeepEnd', 0, 100, 0, '', 'Number of layers to keep from the end.'),
                el('div', 'text-center text-[10px] font-mono text-emerald-400 mt-1 h-4', '', { id: 'layerPlanDisplay' })
            ]),

            // Width & Vocab
            control('WIDTH %', 'rngWidth', 'valWidth', 10, 100, 100, '%', 'Reduces the FFN width of each layer.'),
            control('VOCAB SIZE', 'rngVocab', 'valVocab', 1000, 260000, 260000, '', 'Prunes vocab to the most frequent N tokens matching the regex filter.'),

            // Regex Filtering
            el('div', 'flex-col mt-2', [
                el('label', 'text-xs text-muted font-bold mb-2', 'VOCAB FILTER'),
                el('label', 'flex items-center justify-between cursor-pointer', [
                    el('span', 'text-xs font-bold text-muted', 'MODE: REMOVE ↔ KEEP'),
                    el('input', '', '', { type: 'checkbox', id: 'regexModeToggle', checked: true })
                ]),
                el('textarea', 'w-full h-20 font-mono text-xs p-2 mt-1', DEFAULT_KEEP_REGEX, { id: 'keepRegexArea', title: 'Keep tokens matching this regex.' }),
                el('textarea', 'w-full h-20 font-mono text-xs p-2 mt-1', '', { id: 'removeRegexArea', placeholder: 'Enter regex for tokens to remove...', style:'display:none;' })
            ]),

            // Action
            el('button', 'btn danger w-full mt-2', 'PERFORM SURGERY', { id: 'btnLobotomize' }),
            el('div', 'h-24 bg-black border border-base p-2 text-[10px] font-mono text-muted overflow-auto', '', { id: 'surgeryLog' })
        ])
    ], { id: 'surgerySection' });
}

function control(label, idRng, idVal, min, max, val, suffix, title) {
    return el('div', 'flex-col mb-2', [
        el('div', 'flex justify-between text-xs text-muted font-bold', [
            el('label', '', label, { title: title || '' }),
            el('span', 'font-mono text-primary', val + suffix, { id: idVal })
        ]),
        el('input', '', '', { type: 'range', id: idRng, min, max, value: val })
    ]);
}

export function buildLogsPanel() {
    return el('div', 'panel flex-1 min-h-0', [
        el('div', 'panel-header', 'SYSTEM LOGS'),
        el('div', 'flex-1 bg-black p-2 overflow-auto', '', { id: 'logs', style: 'display:flex; flex-direction:column; gap:2px;' })
    ]);
}