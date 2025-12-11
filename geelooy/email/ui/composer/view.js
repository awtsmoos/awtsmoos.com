
// B"H
import { handleInput, handleSend, handleMagneticMove, handleMagneticLeave, switchMode, toggleSubject, initComposerListeners, toggleFullscreen, toggleMinimize, toggleEnterSend } from './actions.js';
import { composerState } from './state.js';

export function renderComposerView(ui, parent) {
    // Initialize listeners securely
    initComposerListeners();

    // 1. Toolbar & Tabs Container
    ui.html({
        parent,
        tag: 'div',
        shaym: 'composerArea',
        classList: ['composer-area'],
        children: [
            {
                tag: 'div',
                classList: ['composer-box'],
                children: [
                    // TOP BAR: Tabs + Tools
                    {
                        tag: 'div', classList: ['flex', 'space-between', 'align-center'], style: 'background:rgba(255,255,255,0.02); padding-right:10px; border-bottom:1px solid rgba(255,255,255,0.05);',
                        events: {
                            // CLICK TO RESTORE
                            click: (e) => {
                                // Only trigger if minimized and not clicking a button
                                if(ui.getHtml('composerArea').classList.contains('minimized')) {
                                    if(e.target.tagName !== 'BUTTON') {
                                        toggleMinimize(ui);
                                    }
                                }
                            }
                        },
                        children: [
                            {
                                tag: 'div', classList: ['composer-tabs'],
                                children: [
                                    { tag: 'div', classList: ['mode-tab', 'active'], textContent: 'VISUAL', dataset: { mode: 'visual' }, events: { click: (e) => switchMode(e, ui) } },
                                    { tag: 'div', classList: ['mode-tab'], textContent: 'MARKDOWN', dataset: { mode: 'markdown' }, events: { click: (e) => switchMode(e, ui) } },
                                    { tag: 'div', classList: ['mode-tab'], textContent: 'HTML', dataset: { mode: 'html' }, events: { click: (e) => switchMode(e, ui) } }
                                ]
                            },
                            // Window Controls
                            {
                                tag: 'div', classList: ['flex', 'gap-2'],
                                children: [
                                    {
                                        tag: 'button', classList: ['icon-btn', 'win-ctrl'], title: 'Enter Sends?',
                                        shaym: 'btnEnterSend',
                                        style: 'font-size: 0.7rem; width:auto; padding: 0 6px; border:1px solid #333; margin-right:8px;',
                                        textContent: 'ENTER: ↵', // Default state
                                        events: { click: (e) => toggleEnterSend(e) }
                                    },
                                    {
                                        tag: 'button', classList: ['icon-btn'], title: 'Toggle Subject',
                                        textContent: '🏷️', 
                                        events: { click: () => toggleSubject(ui) }
                                    },
                                    {
                                        tag: 'button', classList: ['icon-btn', 'win-ctrl'], title: 'Maximize',
                                        textContent: '⛶', 
                                        events: { click: () => toggleFullscreen(ui) }
                                    },
                                    {
                                        tag: 'button', classList: ['icon-btn', 'win-ctrl'], title: 'Minimize',
                                        textContent: '_', 
                                        events: { click: (e) => { e.stopPropagation(); toggleMinimize(ui); } }
                                    }
                                ]
                            }
                        ]
                    },
                    
                    // CONTENT CONTAINER (Collapsible)
                    {
                        tag: 'div', shaym: 'composerContent', classList: ['composer-content'],
                        children: [
                            // FORMATTING TOOLBAR
                            {
                                tag: 'div', shaym: 'visualToolbar', classList: ['visual-toolbar'],
                                children: [
                                    { tag: 'button', textContent: 'B', style:'font-weight:bold', events: { click: () => document.execCommand('bold') } },
                                    { tag: 'button', textContent: 'I', style:'font-style:italic', events: { click: () => document.execCommand('italic') } },
                                    { tag: 'button', textContent: 'H1', events: { click: () => document.execCommand('formatBlock', false, '<h1>') } },
                                    { tag: 'button', textContent: 'H2', events: { click: () => document.execCommand('formatBlock', false, '<h2>') } }
                                ]
                            },

                            // SUBJECT LINE
                            {
                                tag: 'div', shaym: 'subjectWrapper', classList: ['subject-wrapper', 'hidden'],
                                children: [
                                    { tag: 'input', shaym: 'chatSubject', classList: ['subject-input'], placeholder: 'New Subject Protocol...' }
                                ]
                            },

                            // INPUT AREA
                            {
                                tag: 'div', classList: ['input-wrapper'],
                                children: [
                                    // 1. VISUAL EDITOR
                                    {
                                        tag: 'div',
                                        shaym: 'visualEditor',
                                        classList: ['message-input', 'visual-editor'],
                                        contentEditable: true,
                                        events: {
                                            input: (e) => handleInput(e),
                                            keydown: (e) => {
                                                if (e.key === 'Enter') {
                                                    // State-based logic
                                                    if (composerState.enterToSend) {
                                                        if (!e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSend(ui);
                                                        }
                                                    } else {
                                                        // Ctrl+Enter always sends
                                                        if (e.ctrlKey) {
                                                            e.preventDefault();
                                                            handleSend(ui);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    // 2. CODE EDITOR
                                    {
                                        tag: 'textarea',
                                        shaym: 'codeEditor',
                                        classList: ['message-input', 'source-editor', 'hidden'],
                                        events: {
                                            input: (e) => handleInput(e),
                                            keydown: (e) => {
                                                if (e.key === 'Enter' && e.ctrlKey) {
                                                    e.preventDefault();
                                                    handleSend(ui);
                                                }
                                            }
                                        }
                                    }
                                ]
                            },

                            // ACTION BAR
                            {
                                tag: 'div', style: 'padding: 8px; display:flex; justify-content:flex-end; border-top:1px solid rgba(255,255,255,0.05);',
                                children: [
                                    {
                                        tag: 'button',
                                        classList: ['send-btn'],
                                        textContent: '➤',
                                        events: {
                                            click: () => handleSend(ui),
                                            mousemove: handleMagneticMove,
                                            mouseleave: handleMagneticLeave
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
}
