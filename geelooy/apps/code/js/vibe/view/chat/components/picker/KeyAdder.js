
// B"H
import { HTML } from '../../../../../html-generator.js';
import { PickerStyles as S } from './PickerStyles.js';
import { Providers } from '../../../../agent/state/ProviderRegistry.js';
import { KeyRegistry } from '../../../../agent/state/KeyRegistry.js';

export const KeyAdder = {
    render(onAdded) {
        return HTML({
            style: S.addBox,
            children: [
                { tag: 'span', style: { ...S.sectionTitle, color: 'var(--neon-lime)', marginBottom: '15px' }, text: 'Register New Dimension' },
                {
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
                    children: [
                        this._inputGroup(Providers.google, onAdded),
                        this._inputGroup(Providers.openrouter, onAdded)
                    ]
                }
            ]
        });
    },

    _inputGroup(p, onAdded) {
        return {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
            children: [
                {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    children: [
                        { style: { fontSize: '13px', fontWeight: 'bold' }, text: `${p.icon} ${p.name}` },
                        { tag: 'a', href: p.link, target: '_blank', style: S.link, text: 'Get Key' }
                    ]
                },
                {
                    style: { display: 'flex', gap: '5px' },
                    children: [
                        {
                            tag: 'input', className: 'key-in', placeholder: `${p.prefix}...`,
                            style: { flexGrow: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px' },
                            onKeyDown: (e) => { if (e.key === 'Enter') this._submit(e.target, onAdded); }
                        },
                        {
                            tag: 'button', className: 'primary-btn', text: '+',
                            style: { minHeight: 0, padding: '0 12px' },
                            onClick: (e) => this._submit(e.target.previousElementSibling, onAdded)
                        }
                    ]
                }
            ]
        };
    },

    _submit(input, onAdded) {
        const val = input.value.trim();
        if (val) {
            const newK = KeyRegistry.add(val);
            onAdded(newK.id);
        }
    }
};
