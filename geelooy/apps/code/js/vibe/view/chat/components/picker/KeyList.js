
// B"H
import { HTML } from '../../../../../html-generator.js';
import { PickerStyles as S } from './PickerStyles.js';
import { ModelManager } from '../../../../model-manager.js';
import { KeyRegistry } from '../../../../agent/state/KeyRegistry.js';

export const KeyList = {
    render(keys, onUpdate) {
        if (keys.length === 0) return null;

        const activeKeyObj = ModelManager.getActiveKeyObject();

        return HTML({
            style: { marginBottom: '25px' },
            children: [
                { tag: 'span', style: { ...S.sectionTitle, color: 'var(--neon-magenta)' }, text: 'Registered Oracle Credentials' },
                ...keys.map(k => {
                    const isKeyInUse = activeKeyObj?.id === k.id;
                    return {
                        style: {
                            ...S.keyCard(isKeyInUse),
                            cursor: 'default' // Keys are no longer manually "selected"
                        },
                        children: [
                            {
                                style: { display: 'flex', flexDirection: 'column' },
                                children: [
                                    { 
                                        style: { fontWeight: 'bold', fontSize: '14px', color: isKeyInUse ? 'var(--neon-cyan)' : '#fff' }, 
                                        text: k.label + (isKeyInUse ? ' (Active)' : '') 
                                    },
                                    { tag: 'span', style: { fontSize: '10px', opacity: 0.5 }, text: `Provider: ${k.provider.toUpperCase()}` }
                                ]
                            },
                            { 
                                tag: 'button', text: 'Delete', 
                                style: { background: 'none', border: 'none', color: 'var(--color-accent-danger)', fontSize: '11px', cursor: 'pointer', padding: '10px' },
                                onClick: async (e) => { 
                                    e.stopPropagation(); 
                                    KeyRegistry.remove(k.id); 
                                    await ModelManager.refreshModels();
                                    onUpdate();
                                }
                            }
                        ]
                    };
                })
            ]
        });
    }
};
