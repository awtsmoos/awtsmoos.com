
// B"H
import { AppStore } from '../state/store.js';
import { PostActions } from './actions/posts.js';
import { StoryActions } from './actions/stories.js';
import { CommentActions } from './actions/comments.js';
import { ThreadActions } from './actions/comments/thread.js';
import { UIActions } from './actions/ui.js';
import { GalleryActions } from './actions/gallery.js';
import { ChatActions } from './actions/chat/index.js';
import { HistoryManager } from '../core/routing/HistoryManager.js';

export const Actions = {
    renderer: null,
    
    update() { 
        AppStore.saveState(); 
        HistoryManager.sync();
        if (this.renderer) this.renderer(); 
    },

    ...PostActions,
    ...StoryActions,
    ...CommentActions,
    ...ThreadActions,
    ...GalleryActions,
    ...ChatActions,
    ...UIActions
};
