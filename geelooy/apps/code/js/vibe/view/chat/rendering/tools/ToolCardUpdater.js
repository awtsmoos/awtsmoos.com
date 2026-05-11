
// B"H
/**
 * @file ToolCardUpdater.js
 * @brief Updates cards in real-time, replacing placeholders with clear intent labels.
 */

import { HTML } from '../../../../../html-generator.js';

export const ToolCardUpdater = {
    update(card, displayLabel, displayContent, isFinished) {
        const summaryLabel = card.querySelector('.vibe-action-label');
        const contentBody = card.querySelector('.action-content');
        const iconContainer = card.querySelector('.status-icon');

        if (summaryLabel) {
            // Provide feedback while drafting long contents
            summaryLabel.textContent = isFinished ? displayLabel : ('(Drafting Essence) ' + displayLabel);
        }
        
        if (!isFinished && contentBody) {
            const currentStr = (typeof displayContent === 'object' && displayContent !== null) ? JSON.stringify(displayContent) : String(displayContent);
            if (contentBody.dataset.raw !== currentStr) {
                contentBody.innerHTML = '';
                if (typeof displayContent === 'object' && displayContent !== null) {
                    contentBody.appendChild(HTML(displayContent));
                } else {
                    contentBody.textContent = displayContent;
                }
                contentBody.dataset.raw = currentStr;
                const pre = contentBody.querySelector('pre');
                if (pre) pre.scrollTop = pre.scrollHeight;
            }
        } 
        else if (isFinished && contentBody && !contentBody.dataset.finalized) {
            contentBody.innerHTML = '';
            if (displayContent && typeof displayContent === 'object' && !Array.isArray(displayContent) && !(displayContent instanceof HTMLElement)) {
                contentBody.appendChild(HTML(displayContent));
            } else if (displayContent instanceof HTMLElement) {
                contentBody.appendChild(displayContent);
            } else { contentBody.textContent = String(displayContent); }
            contentBody.dataset.finalized = "true";
        }
        
        if (iconContainer) {
            iconContainer.innerHTML = '';
            if (isFinished) {
                iconContainer.appendChild(document.createTextNode('✓'));
                if (summaryLabel) summaryLabel.classList.remove('pulse-processing');
            } else {
                const spin = document.createElement('div');
                spin.className = 'vibe-spinner';
                iconContainer.appendChild(spin);
                if (summaryLabel) summaryLabel.classList.add('pulse-processing');
            }
        }
    }
};
