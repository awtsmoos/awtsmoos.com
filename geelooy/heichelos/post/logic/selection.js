//B"H
/**
 * The Revelation Engine - Logic for the Living Word
 * This is the scribe's memory, governing the creation, persistence, and resurrection
 * of highlights and notes, manifestations of the user's journey through the Divine text.
 */
import { calculateGematria } from "./gematria.js";
import { containsHebrew } from "../functions/utils.js";

let popover;
let currentSelection;
let notePopover;

// --- INITIALIZATION ---

/**
 * @method initSelectionPopover
 * @description B"H - Forges the popover element once and binds its event listeners.
 * This vessel of interaction lies dormant until summoned by the user's focus.
 */
export function initSelectionPopover() {
    if (document.getElementById('selection-popover')) return;

    popover = document.createElement('div');
    popover.id = 'selection-popover';
    popover.className = 'selection-popover';

    const highlightBtn = createPopoverButton('HIGHLIGHT');
    const noteBtn = createPopoverButton('NOTE');
    const aiBtn = createPopoverButton('ASK AI');
    const gematriaBtn = createPopoverButton('ג');
    gematriaBtn.id = 'gematria-btn';
    gematriaBtn.title = "Gematria Oracle";

    const colorPalette = document.createElement('div');
    colorPalette.className = 'highlight-palette';
    ['yellow', 'pink', 'cyan'].forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = `palette-color ${color}`;
        colorBtn.dataset.color = color;
        colorPalette.appendChild(colorBtn);
    });
    
    highlightBtn.appendChild(colorPalette);
    highlightBtn.addEventListener('mouseenter', () => colorPalette.style.display = 'flex');
    highlightBtn.addEventListener('mouseleave', () => colorPalette.style.display = 'none');
    
    colorPalette.addEventListener('click', e => {
        if (e.target.dataset.color) handleHighlight(e.target.dataset.color);
    });

    noteBtn.addEventListener('click', handleNote);
    aiBtn.addEventListener('click', handleAskAI);
    gematriaBtn.addEventListener('click', handleGematria);

    popover.append(highlightBtn, noteBtn, gematriaBtn, aiBtn);
    document.body.appendChild(popover);

    // B"H - Create the vessel for revealing notes
    notePopover = document.createElement('div');
    notePopover.className = 'note-popover';
    document.body.appendChild(notePopover);
}

function createPopoverButton(text) {
    const btn = document.createElement('button');
    btn.className = 'popover-btn';
    btn.textContent = text;
    return btn;
}

// --- VISIBILITY ---

export function showSelectionPopover(selection) {
    if (!popover) initSelectionPopover();
    
    currentSelection = selection;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    popover.style.top = `${rect.top + window.scrollY - popover.offsetHeight - 10}px`;
    popover.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (popover.offsetWidth / 2)}px`;
    
    // B"H - Reveal the Gematria Oracle only for sacred text
    const gematriaBtn = document.getElementById('gematria-btn');
    if (gematriaBtn) {
        gematriaBtn.style.display = containsHebrew(selection.toString()) ? 'inline-flex' : 'none';
    }

    popover.classList.add('visible');
}

// --- ACTIONS ---

function handleHighlight(color) {
    if (!currentSelection || currentSelection.isCollapsed) return;
    
    const range = currentSelection.getRangeAt(0);
    const textId = range.commonAncestorContainer.parentElement.closest('[data-awtsmoos-text-id]')?.dataset.awtsmoosTextId;
    const selectedText = currentSelection.toString();

    if (!textId) {
        console.error("B\"H - Could not find text anchor for highlight.");
        return;
    }
    
    document.designMode = "on";
    document.execCommand('hiliteColor', false, color);
    document.designMode = "off";

    const parent = range.commonAncestorContainer.parentElement;
    parent.querySelectorAll('font[color]').forEach(el => {
        const mark = document.createElement('mark');
        mark.className = `highlight-${color}`;
        while(el.firstChild) mark.appendChild(el.firstChild);
        el.replaceWith(mark);
    });
    
    saveAnnotation('highlight', { textId, selectedText, color });
    
    popover.classList.remove('visible');
    currentSelection.removeAllRanges();
}

function handleNote() {
    if (!currentSelection || currentSelection.isCollapsed) return;

    const noteContent = prompt("Enter your note for the selected text:");
    if (noteContent === null || noteContent.trim() === "") return;

    const range = currentSelection.getRangeAt(0);
    const textId = range.commonAncestorContainer.parentElement.closest('[data-awtsmoos-text-id]')?.dataset.awtsmoosTextId;
    const selectedText = currentSelection.toString();
    const noteId = `note-${Date.now()}`;

    if (!textId) {
        console.error("B\"H - Could not find text anchor for note.");
        return;
    }

    const noteElement = document.createElement('awtsmoos-note');
    noteElement.dataset.noteId = noteId;
    range.surroundContents(noteElement);
    
    saveAnnotation('note', { noteId, textId, selectedText, noteContent });
    createMarginalSigil(noteElement);

    popover.classList.remove('visible');
    currentSelection.removeAllRanges();
}

function handleAskAI() {
    if (!currentSelection) return;
    const text = currentSelection.toString();
    
    const options = { prefill: `> ${text}\n\n`, autoSend: false };

    if (window.awtsmoosAiModule?.openAIChat) {
        window.awtsmoosAiModule.openAIChat(options);
    } else {
        import('../ai/chat.js').then(module => {
            window.awtsmoosAiModule = module;
            module.openAIChat(options);
        });
    }

    popover.classList.remove('visible');
}

/**
 * @method handleGematria
 * @description B"H - Calculates the numerical soul of the selected text and
 * commands the AI Oracle to reveal its mystical connections across creation.
 */
function handleGematria() {
    if (!currentSelection) return;
    const text = currentSelection.toString().trim();
    if (!text) return;
    
    const value = calculateGematria(text);
    
    const prompt = `The Hebrew phrase "${text}" has a Gematria (numerical value) of ${value}. Please reveal other significant Hebrew words, phrases, or concepts from Torah and Kabbalah that share this same numerical value. For each, provide the Hebrew spelling and a brief mystical explanation of the connection.`;

    const options = { prefill: prompt, autoSend: true };

    if (window.awtsmoosAiModule?.openAIChat) {
        window.awtsmoosAiModule.openAIChat(options);
    } else {
        import('../ai/chat.js').then(module => {
            window.awtsmoosAiModule = module;
            module.openAIChat(options);
        });
    }

    popover.classList.remove('visible');
    currentSelection.removeAllRanges();
}


// --- PERSISTENCE ---

function getStorageKey() {
    return `awtsmoos-annotations-${window.post?.id || 'unknown'}`;
}

function saveAnnotation(type, data) {
    const key = getStorageKey();
    const annotations = JSON.parse(localStorage.getItem(key) || '{"highlights":[], "notes":[]}');
    
    if (type === 'highlight') annotations.highlights.push(data);
    else if (type === 'note') annotations.notes.push(data);

    localStorage.setItem(key, JSON.stringify(annotations));
}

export function loadAnnotations() {
    const key = getStorageKey();
    const annotations = JSON.parse(localStorage.getItem(key) || '{"highlights":[], "notes":[]}');

    // Load Highlights
    annotations.highlights.forEach(h => {
        const container = document.querySelector(`[data-awtsmoos-text-id="${h.textId}"]`);
        if (container) {
            const escapedText = h.selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedText, 'g');
            container.innerHTML = container.innerHTML.replace(regex, `<mark class="highlight-${h.color}">${h.selectedText}</mark>`);
        }
    });

    // Load Notes
    annotations.notes.forEach(n => {
        const container = document.querySelector(`[data-awtsmoos-text-id="${n.textId}"]`);
        if (container) {
            const escapedText = n.selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedText, 'g');
            container.innerHTML = container.innerHTML.replace(regex, `<awtsmoos-note data-note-id="${n.noteId}">${n.selectedText}</awtsmoos-note>`);
        }
    });

    document.querySelectorAll('awtsmoos-note').forEach(createMarginalSigil);
}

function createMarginalSigil(noteElement) {
    const noteId = noteElement.dataset.noteId;
    const section = noteElement.closest('.section');
    if (!section) return;

    const sigil = document.createElement('div');
    sigil.className = 'marginal-sigil';
    sigil.dataset.noteId = noteId;
    sigil.textContent = 'N';
    section.appendChild(sigil);

    const showNote = () => {
        const annotations = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
        const noteData = annotations.notes?.find(n => n.noteId === noteId);
        if (noteData) {
            notePopover.innerHTML = noteData.noteContent;
            const rect = sigil.getBoundingClientRect();
            notePopover.style.top = `${rect.top + window.scrollY}px`;
            notePopover.style.left = `${rect.left - notePopover.offsetWidth - 10}px`;
            notePopover.style.opacity = '1';
        }
    };

    const hideNote = () => {
        notePopover.style.opacity = '0';
    };

    sigil.addEventListener('mouseenter', showNote);
    sigil.addEventListener('mouseleave', hideNote);
    noteElement.addEventListener('mouseenter', showNote);
    noteElement.addEventListener('mouseleave', hideNote);
}
