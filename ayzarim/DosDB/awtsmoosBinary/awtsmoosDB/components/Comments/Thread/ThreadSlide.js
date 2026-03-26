
// B"H
/**
 * @module ThreadSlide
 */
import { AppStore } from '../../../state/store.js';
import { CommentItem } from '../Item/index.js';

export function ThreadSlide(commentId) {
    const post = AppStore.posts.find(p => p.id === AppStore.activePostId);
    if (!post) return { tag: 'div', text: 'Thread lost...' };

    let parent = null;
    const findComment = (list) => {
        for (let c of list) {
            if (c.id === commentId) { parent = c; return true; }
            if (c.replies && findComment(c.replies)) return true;
        }
        return false;
    };
    findComment(post.comments || []);

    if (!parent) return { tag: 'div', text: 'Parent not found...' };

    return {
        tag: 'div',
        className: 'thread-slide-vessel animate-slide-in-right',
        children: [
            {
                tag: 'div',
                className: 'thread-slide-header',
                children: [
                    { 
                        tag: 'button', 
                        className: 'thread-back-btn',
                        on: { click: () => window.AppGlobals.Actions.exitThread() },
                        text: '❮ Thread' 
                    }
                ]
            },
            {
                tag: 'div',
                className: 'thread-parent-focus',
                children: [CommentItem(parent, 0)]
            },
            { tag: 'div', className: 'ui-border-b', style: { margin: '16px 0' } },
            {
                tag: 'div',
                className: 'thread-replies-stream',
                children: (parent.replies || []).map(r => CommentItem(r, 0))
            }
        ]
    };
}
