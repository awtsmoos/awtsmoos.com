
// B"H
/**
 * @file ModelPickerModal.js
 */

import { HTML } from '../../../../html-generator.js';
import { KeyRegistry } from '../../../agent/state/KeyRegistry.js';
import { ModelManager } from '../../../model-manager.js';
import { PickerStyles as S } from './picker/PickerStyles.js';

import { KeyList } from './picker/KeyList.js';
import { KeyAdder } from './picker/KeyAdder.js';
import { ModelGrid } from './picker/ModelGrid.js';

export const ModelPickerModal = {
    show(tab, controller) {
        const overlay = HTML({
            style: {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.85)', zIndex: 100000, display: 'flex',
                justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)'
            },
            onClick: (e) => { if (e.target === overlay) overlay.remove(); },
            children: [this._buildMainBox(tab, controller, () => overlay.remove())]
        });
        document.body.appendChild(overlay);
    },

    _buildMainBox(tab, controller, close) {
        const keys = KeyRegistry.getAll();

        return HTML({
            style: S.box,
            children: [
                // Header
                {
                    style: { padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' },
                    children: [
                        { 
                            style: { display: 'flex', alignItems: 'center', gap: '10px' },
                            children: [
                                { tag: 'span', style: { fontSize: '20px' }, text: '◈' },
                                { tag: 'h2', style: { margin: 0, fontSize: '18px', color: 'var(--neon-cyan)', letterSpacing: '1px' }, text: 'Oracle Configuration' }
                            ]
                        },
                        { tag: 'button', text: '×', style: { background: 'none', border: 'none', color: '#666', fontSize: '28px', cursor: 'pointer' }, onClick: close }
                    ]
                },
                // Scrollable Content
                {
                    style: { flexGrow: 1, overflowY: 'auto', padding: '24px' },
                    children: [
                        // 1. Key Management
                        KeyList.render(keys, () => this._refresh(tab, controller)),

                        // 2. Add New Key (Detects provider automatically)
                        KeyAdder.render(async () => {
                            await ModelManager.refreshModels();
                            this._refresh(tab, controller);
                        }),

                        // 3. Model Selection (Aggregated from all keys)
                        ModelGrid.render(ModelManager.availableModels, (modelId) => {
                            ModelManager.setModel(modelId);
                            controller.refreshView(tab);
                            close();
                        })
                    ]
                }
            ]
        });
    },

    _refresh(tab, controller) {
        const modal = document.querySelector('.model-picker-box')?.parentElement;
        if (modal) modal.remove();
        this.show(tab, controller);
    }
};
