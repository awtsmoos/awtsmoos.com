
// B"H
/**
 * B"H
 * @module CommentAddition
 * @description The act of manifesting a new spark in the stream of dialogue.
 */
import { AppStore } from '../../store.js';

export const add = (postId, text) => {
    const post = AppStore.posts.find(p => p.id === postId);
    if (!post || !text.trim()) return;
    
    if (!post.comments) post.comments = [];
    
    const newComment = { 
        id: 'c-' + Date.now(), 
        author: AppStore.currentUser.name,
        authorId: 'me',
        text: text.trim(), 
        time: 'Just now', 
        likes: [], 
        replies: [] 
    };

    // Check if we are adding to a specific verse
    const activeVerseId = AppStore.activeVerseId;
    if (activeVerseId && post.sections) {
        const section = post.sections.find(s => s.id === activeVerseId);
        if (section) {
            if (!section.comments) section.comments = [];
            section.comments.push(newComment);
        }
    } else {
        post.comments.push(newComment);
    }
    
    // Reset drafts
    AppStore.drafts.comment = ''; 
    AppStore.saveState();

    // B"H - Trigger global re-render to reflect new state
    if (window.AppGlobals && window.AppGlobals.Actions) {
        window.AppGlobals.Actions.update();
    }
    
    console.log("B\"H - New comment manifested and persisted.");
};

export const prepareReply = (commentId, author) => {
    // For now, simpler direct replies in input
    const input = document.getElementById('comment-input');
    if (input) {
        input.value = `@${author} `;
        input.focus();
    }
};
