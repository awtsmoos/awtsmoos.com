
// B"H
import { handleInput, handleSend, handleMagneticMove, handleMagneticLeave } from './actions.js';

export function renderComposerView(ui, parent) {
    ui.html({
        parent,
        tag: 'div',
        classList: ['chat-composer'],
        children: [
            {
                tag: 'textarea',
                shaym: 'chatInput',
                classList: ['composer-input'],
                placeholder: 'Transmit data...',
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
    });
}
