
// B"H
/**
 * @module CommentInput
 */
import { AppStore } from '../../../state/store.js';

export function CommentInput() {
    const { currentUser } = AppStore;

    return {
        tag: 'div',
        className: 'dialogue-gate-vessel',
        children: [
            {
                tag: 'div',
                className: 'dialogue-gate-row',
                children: [
                    {
                        tag: 'div',
                        className: 'dialogue-input-cli',
                        children: [
                            {
                                tag: 'textarea',
                                id: 'comment-input',
                                placeholder: 'Speak from the heart...',
                                className: 'dialogue-textarea',
                                on: {
                                    input: (e) => {
                                        e.target.style.height = '';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                        AppStore.drafts.comment = e.target.value;
                                    }
                                }
                            },
                            {
                                tag: 'button',
                                className: 'emoji-trigger',
                                on: { click: () => window.AppGlobals.Actions.toggleModal('reactionMenu', true, 'comment-input', 'input') },
                                text: '😊'
                            }
                        ]
                    },
                    {
                        tag: 'button',
                        className: 'holy-send-btn',
                        on: {
                            click: () => {
                                const input = document.getElementById('comment-input');
                                if (input && window.AppGlobals.Actions) {
                                    window.AppGlobals.Actions.addComment(AppStore.activePostId, input.value);
                                    input.value = '';
                                }
                            }
                        },
                        text: '➤'
                    }
                ]
            }
        ]
    };
}
