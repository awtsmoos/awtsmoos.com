
// B"H
import { AppStore } from '../../../state/store.js';
import { CommentIdentity } from './Identity.js';
import { CommentContent } from './Content.js';
import { CommentActionsRow } from './Actions.js';

export function CommentItem(c, depth = 0) {
    const authorId = c.authorId || (c.author === 'Me' ? 'me' : null);
    const avatarUrl = authorId === 'me' ? AppStore.currentUser.avatar : (c.avatar || `https://i.pravatar.cc/100?u=${c.author}`);
    const hasReplies = c.replies && c.replies.length > 0;

    // Limit automatic reply rendering in deep threads
    const shouldRenderReplies = depth < 2 && hasReplies;

    return {
        tag: 'div',
        className: `comment-item animate-fade-in-up depth-${depth}`,
        dataset: { commentId: c.id },
        children: [
            CommentIdentity(avatarUrl, authorId, hasReplies && shouldRenderReplies),
            {
                tag: 'div',
                className: 'flex flex-col flex-1 min-w-0',
                children: [
                    CommentContent(c, authorId),
                    CommentActionsRow(c),
                    // Recursive Replies limited by Seder
                    (shouldRenderReplies) ? {
                        tag: 'div',
                        className: 'mt-2 space-y-2',
                        children: c.replies.map(r => CommentItem(r, depth + 1))
                    } : null
                ].filter(Boolean)
            }
        ]
    };
}
