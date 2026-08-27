
// B"H
import { AppStore } from '../state/store.js';
import { Architect } from '../core/creation/SefiroticArchitect.js';
import { CommentItem } from './Comments/CommentItem.js';
import { CommentInput } from './Comments/CommentInput/index.js';
import { ThreadSlide } from './Comments/Thread/ThreadSlide.js';

export function CommentsOverlay() {
    const post = AppStore.posts.find(p => p.id === AppStore.activePostId);
    if (!post) return Architect.render({ tag: 'div', text: 'Spirit not found...' });

    const threadId = AppStore.activeThreadId;
    const comments = post.comments || [];
    const closeDialog = () => window.AppGlobals.Actions.toggleModal('comments', false);

    const blueprint = [
        { tag: 'div', className: 'modal-backdrop-void', on: { click: closeDialog } },
        {
            tag: 'div',
            className: 'bottom-sheet-vessel animate-slide-up',
            children: [
                { tag: 'div', className: 'ui-drag-handle', style: { margin: '12px auto' } },
                threadId ? ThreadSlide(threadId) : {
                    tag: 'div',
                    className: 'main-dialogue-stream',
                    style: { flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
                    children: [
                        {
                            tag: 'div',
                            className: 'ui-row-between ui-p-md ui-border-b',
                            children: [
                                { tag: 'h2', className: 'ui-text-title', text: 'Dialogue' },
                                { tag: 'button', on: { click: closeDialog }, text: '✕' }
                            ]
                        },
                        {
                            tag: 'div',
                            className: 'scrollable-body',
                            style: { flex: '1', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' },
                            children: comments.length > 0 
                                ? comments.map(c => CommentItem(c)) 
                                : [{ tag: 'div', className: 'ui-empty-state', children: [{ tag: 'div', text: '💭' }, { tag: 'p', text: 'Start the conversation' }] }]
                        }
                    ]
                },
                {
                    tag: 'div',
                    className: 'glass-panel border-t',
                    html: CommentInput()
                }
            ]
        }
    ];

    return Architect.render(blueprint);
}
