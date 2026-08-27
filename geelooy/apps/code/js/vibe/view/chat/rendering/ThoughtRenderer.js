
// B"H
/**
 * @file ThoughtRenderer.js
 * @brief The Sculptor of the Internal Monologue.
 */

import { HTML } from '../../../../html-generator.js';
import { MarkdownParser } from '../../../modules/markdown-parser.js';

export const ThoughtRenderer = {
    /**
     * B"H - Updates the cognitive layer with real-time reasoning.
     */
    render(layer, reasoningText, isStreamingUnclosedThought) {
        if (!reasoningText || reasoningText.trim() === "") {
            layer.innerHTML = '';
            layer.style.display = 'none';
            return;
        }

        layer.style.display = 'block';
        let detailsEl = layer.querySelector('details.vibe-model-thoughts');
        
        if (!detailsEl) {
            detailsEl = HTML({
                tag: 'details',
                className: 'vibe-model-thoughts',
                open: false, 
                style: {
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,0,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    boxShadow: 'inset 0 0 10px rgba(255,0,255,0.05)',
                    transition: 'all 0.3s ease',
                    marginBottom: '10px'
                },
                children: [
                    {
                        tag: 'summary',
                        style: {
                            cursor: 'pointer', color: 'var(--neon-magenta)', fontWeight: 'bold', 
                            fontSize: '0.9em', userSelect: 'none', outline: 'none', 
                            display: 'inline-flex', alignItems: 'center', gap: '8px'
                        },
                        children: [
                            { tag: 'span', className: 'thought-icon', style: { fontSize: '1.2em' }, text: '🧠' },
                            { tag: 'span', className: 'thought-title', text: 'Cognitive Emanation' }
                        ]
                    },
                    {
                        className: 'vibe-md-container thought-content',
                        style: {
                            fontSize: '0.9em', lineHeight: '1.6', opacity: '0.85', 
                            paddingTop: '10px', marginTop: '8px', borderTop: '1px dashed rgba(255,0,255,0.2)',
                            maxHeight: '300px', overflowY: 'auto'
                        }
                    }
                ]
            });
            layer.appendChild(detailsEl);
        }

        const titleSpan = detailsEl.querySelector('.thought-title');
        const iconSpan = detailsEl.querySelector('.thought-icon');
        
        if (isStreamingUnclosedThought) {
            detailsEl.style.boxShadow = '0 0 15px rgba(255,0,255,0.3) inset';
            titleSpan.textContent = 'Observing the Void (Reasoning)...';
            iconSpan.style.animation = 'pulse-opacity 0.8s infinite alternate';
            detailsEl.open = true;
        } else {
            detailsEl.style.boxShadow = 'inset 0 0 10px rgba(255,0,255,0.05)';
            titleSpan.textContent = 'Reasoning Complete';
            iconSpan.style.animation = 'none';
        }

        const contentContainer = detailsEl.querySelector('.thought-content');
        if (contentContainer) {
            if (contentContainer.dataset.raw !== reasoningText) {
                contentContainer.innerHTML = MarkdownParser.parse(reasoningText);
                contentContainer.dataset.raw = reasoningText;
                if (isStreamingUnclosedThought) {
                    contentContainer.scrollTop = contentContainer.scrollHeight;
                }
            }
        }
    }
};
