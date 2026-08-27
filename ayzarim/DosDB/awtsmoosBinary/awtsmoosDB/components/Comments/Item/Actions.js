
// B"H
/**
 * @module CommentActionsRow
 */
export function CommentActionsRow(c) {
    const hasReplies = c.replies && c.replies.length > 0;
    
    return {
        tag: 'div',
        className: 'comment-interaction-bar',
        children: [
            { 
                tag: 'button', 
                className: 'comment-interaction-btn', 
                on: { click: () => { if(window.AppGlobals.Actions) window.AppGlobals.Actions.showToast("Resonance recorded."); } },
                text: 'Like' 
            },
            { 
                tag: 'button', 
                className: 'comment-interaction-btn', 
                on: { click: () => { if(window.AppGlobals.Actions) window.AppGlobals.Actions.prepareReply(c.id, c.author); } },
                text: 'Reply' 
            },
            hasReplies ? { 
                tag: 'button', 
                className: 'comment-interaction-btn thread-link', 
                on: { click: () => { if(window.AppGlobals.Actions) window.AppGlobals.Actions.navigateToThread(c.id); } },
                text: `View ${c.replies.length} replies` 
            } : null
        ].filter(Boolean)
    };
}
