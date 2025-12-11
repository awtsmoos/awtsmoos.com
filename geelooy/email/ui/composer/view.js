
// B"H
import { handleInput, handleSend, handleMagneticMove, handleMagneticLeave, switchMode, toggleSubject, initComposerListeners } from './actions.js';

export function renderComposerView(ui, parent) {
    // Initialize listeners securely
    initComposerListeners();

    // 1. Toolbar & Tabs Container
    ui.html({
        parent,
        tag: 'div',
        classList: ['composer-area'],
        children: [
            {
                tag: 'div',
                classList: ['composer-box'],
                children: [
                    // TOP BAR: Tabs + Tools
                    {
                        tag: 'div', classList: ['flex', 'space-between', 'align-center'], style: 'background:rgba(255,255,255,0.02); padding-right:10px;',
                        children: [
                            {
                                tag: 'div', classList: ['composer-tabs'],
                                children: [
                                    { tag: 'div', classList: ['mode-tab', 'active'], textContent: 'VISUAL', dataset: { mode: 'visual' }, events: { click: (e) => switchMode(e, ui) } },
                                    { tag: 'div', classList: ['mode-tab'], textContent: 'MARKDOWN', dataset: { mode: 'markdown' }, events: { click: (e) => switchMode(e, ui) } },
                                    { tag: 'div', classList: ['mode-tab'], textContent: 'HTML', dataset: { mode: 'html' }, events: { click: (e) => switchMode(e, ui) } }
                                ]
                            },
                            {
                                tag: 'button', classList: ['icon-btn'], title: 'Toggle Subject',
                                textContent: '🏷️', 
                                events: { click: () => toggleSubject(ui) }
                            }
                        ]
                    },
                    
                    // FORMATTING TOOLBAR (Visible in Visual Mode)
                    {
                        tag: 'div', shaym: 'visualToolbar', classList: ['visual-toolbar'],
                        children: [
                            { tag: 'button', textContent: 'B', style:'font-weight:bold', events: { click: () => document.execCommand('bold') } },
                            { tag: 'button', textContent: 'I', style:'font-style:italic', events: { click: () => document.execCommand('italic') } },
                            { tag: 'button', textContent: 'H1', events: { click: () => document.execCommand('formatBlock', false, '<h1>') } },
                            { tag: 'button', textContent: 'H2', events: { click: () => document.execCommand('formatBlock', false, '<h2>') } }
                        ]
                    },

                    // SUBJECT LINE (Hidden by default)
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
                            // 1. VISUAL EDITOR (ContentEditable)
                            {
                                tag: 'div',
                                shaym: 'visualEditor',
                                classList: ['message-input', 'visual-editor'],
                                contentEditable: true,
                                events: {
                                    input: (e) => handleInput(e),
                                    keydown: (e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(ui);
                                        }
                                    }
                                }
                            },
                            // 2. CODE EDITOR (Textarea for MD/HTML)
                            {
                                tag: 'textarea',
                                shaym: 'codeEditor',
                                classList: ['message-input', 'source-editor', 'hidden'],
                                events: {
                                    input: (e) => handleInput(e)
                                }
                            }
                        ]
                    },

                    // ACTION BAR
                    {
                        tag: 'div', style: 'padding: 4px; display:flex; justify-content:flex-end;',
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
    });
}
