// B"H
/**
 * @file AutoModeToggle.js
 * @brief The Switch between Brute Force and Autonomy.
 */

import { HTML } from '../../../../html-generator.js';
import { ModelManager } from '../../../model-manager.js';
import { AgentCapabilities } from '../../../agent/logic/AgentCapabilities.js';

export const AutoModeToggle = {
    render(tab, controller) {
        const sess = tab.vibeSession;
        const currentModelId = ModelManager.currentModel;
        const activeModel = ModelManager.availableModels.find(m => m.id === currentModelId);
        
        const supportsNative = activeModel ? AgentCapabilities.supportsTools(activeModel) : false;
        const isAuto = !!sess.viewState.autoMode;

        return HTML({
            className: 'vibe-auto-mode-toggle',
            style: {
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '4px 10px', borderRadius: '20px',
                background: isAuto ? 'rgba(0, 246, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isAuto ? 'var(--neon-cyan)' : '#333'}`,
                cursor: 'pointer', transition: 'all 0.2s ease'
            },
            title: isAuto 
                ? (supportsNative ? 'Autonomous Mode (Native Tool Calling)' : 'Autonomous Mode (Universal Action Protocol)') 
                : 'Toggle Autonomous Mode',
            onClick: () => {
                sess.viewState.autoMode = !sess.viewState.autoMode;
                controller.refreshView(tab);
            },
            children: [
                { 
                    tag: 'span', 
                    style: { fontSize: '10px', fontWeight: 'bold', color: isAuto ? 'var(--neon-cyan)' : 'gray' }, 
                    text: isAuto ? (supportsNative ? 'AUTO: NATIVE' : 'AUTO: UNIVERSAL') : 'AUTO OFF' 
                },
                {
                    style: {
                        width: '30px', height: '14px', borderRadius: '10px',
                        background: isAuto ? 'var(--neon-cyan)' : '#555',
                        position: 'relative', transition: 'background 0.2s'
                    },
                    children: [
                        {
                            style: {
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: '#fff', position: 'absolute', top: '2px',
                                left: isAuto ? '18px' : '2px', transition: 'left 0.2s'
                            }
                        }
                    ]
                }
            ]
        });
    }
};