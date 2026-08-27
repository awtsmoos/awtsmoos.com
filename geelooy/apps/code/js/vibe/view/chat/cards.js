// B"H
/**
 * @file cards.js
 * @brief The Manifestor of Vision: Rendering AI actions into vivid UI vessels.
 * 
 * CHAPTER X: THE REVELATION OF THE STREAM
 * As the Word descends, it passes through the air (thoughts) before hitting 
 * the ground (the disk). This module renders the "streaming" state of the code,
 * allowing the user to witness the inscription of every character.
 */

import { ResponseParser } from '../../modules/ResponseParser.js';
import { StreamHealer } from '../../modules/parser/StreamHealer.js';
import { ManifestationPainter } from './components/ManifestationPainter.js';
import { StreamDataExtractor } from './components/cards/StreamDataExtractor.js';
import { CardDomBuilder } from './components/cards/CardDomBuilder.js';
import { PreviewActionBinder } from './components/cards/PreviewActionBinder.js';
import { ThoughtRevealer } from './components/cards/ThoughtRevealer.js';
import { MARKERS } from '../../modules/parser/constants.js';

export const ChatCards = {
    /**
     * B"H - Renders a model's message, distinguishing between thought and action.
     */
    renderModelMessage(div, content, tab, controller) {
        const tagS = "<" + "change>";
        const tagE = "</" + "change>";
        
        // Clean away the code-block wrappers if the AI used them
        let clean = content.replace(/```xml\s*/gi, '').replace(/```\s*/gi, '').trim();
        const fragments = this._parseFragments(clean, tagS, tagE);
        
        const children = Array.from(div.children);
        fragments.forEach((f, i) => {
            let vessel = children[i];
            if (!vessel) {
                vessel = document.createElement('div');
                vessel.className = f.type === 'thought' ? 'vibe-thought-vessel' : 'vibe-action-vessel';
                div.appendChild(vessel);
            }

            // Only re-render if the content for this fragment has shifted
            if (vessel.dataset.raw !== f.content) {
                vessel.innerHTML = '';
                if (f.type === 'thought') {
                    ThoughtRevealer.reveal(vessel, f.content.trim());
                } else {
                    vessel.appendChild(this._orchestrateCard(f.content, f.complete, tab, controller));
                }
                vessel.dataset.raw = f.content;
            }
        });

        // Purge any dead echoes (lingering old fragments)
        if (children.length > fragments.length) {
            for (let i = fragments.length; i < children.length; i++) children[i].remove();
        }
    },

    /**
     * @function _parseFragments
     * @description Breaks the text stream into alternate periods of thought and XML action.
     */
    _parseFragments(text, tagS, tagE) {
        const frags = [];
        let pos = 0;
        while (pos < text.length) {
            const start = text.indexOf(tagS, pos);
            if (start === -1) {
                frags.push({ type: 'thought', content: text.substring(pos) });
                break;
            }
            if (start > pos) {
                frags.push({ type: 'thought', content: text.substring(pos, start) });
            }
            const end = text.indexOf(tagE, start);
            if (end === -1) {
                frags.push({ type: 'action', content: text.substring(start), complete: false });
                break;
            } else {
                const total = end + tagE.length;
                frags.push({ type: 'action', content: text.substring(start, total), complete: true });
                pos = total;
            }
        }
        return frags;
    },

    /**
     * B"H - Forges an individual manifestation card.
     */
    _orchestrateCard(block, isCompleteInUI, tab, controller) {
        const dom = document.createElement('div');
        dom.className = "vibe-manifest-card";
        
        const root = tab.vibeSession.path || tab.vibeSession.rootPath || "/";
        
        // Heal the unclosed XML so the data extractor can peek inside the open vessel
        const healed = isCompleteInUI ? block : StreamHealer.heal(block);
        
        // Extract the physical attributes
        const partial = StreamDataExtractor.extract(healed);
        const changeObj = { 
            ...partial, 
            path: ResponseParser._normalizePath(root, partial.path),
            // Clean content from Hebrew essence markers for visual streaming
            content: partial.content.split(MARKERS.START).join("").split(MARKERS.END).join("").trim()
        };

        const isActuallyComplete = isCompleteInUI && changeObj.content.length > 0;
        const label = partial.path || "vessel_unnamed";

        ManifestationPainter.paint(dom, isActuallyComplete);

        if (!isActuallyComplete) {
            const phase = block.includes("<content>") ? "Manifesting Essence" : "Inscribing Intent";
            
            // Build the pulsing "Awaiting" header
            dom.appendChild(CardDomBuilder.buildPendingVoid(`Manifesting: ${label}...`));
            
            // If we have content streaming, show it in a dedicated code box
            if (changeObj.content) {
                dom.appendChild(CardDomBuilder.buildStreaming(label, changeObj, phase));
            }
        } else {
            // The vessel is whole! Show the final card with preview buttons.
            const isHtml = changeObj.path && (changeObj.path.endsWith('.html') || changeObj.path.endsWith('.htm'));
            dom.appendChild(CardDomBuilder.buildComplete(label, changeObj, isHtml));
            PreviewActionBinder.bind(dom, changeObj, tab, controller, isHtml);
        }

        return dom;
    }
};