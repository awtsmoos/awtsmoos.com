
// B"H
/**
 * B"H
 * render/overlays/main.js
 */
import { AppStore } from '../../state/store.js';
import { CommentsOverlay } from '../../components/CommentsOverlay.js';
import { PostModal } from '../../components/PostModal.js';
import { UserListModal } from '../../components/UserListModal.js';
import { ChatOverlay } from '../../components/Chat/Overlay.js';
import { PostMenu } from '../../components/Modals/PostMenu.js';
import { ReaderView } from '../../components/ReaderView.js';
import { Architect } from '../../core/creation/SefiroticArchitect.js';

let lastOverlayHash = '';

export function renderMainOverlays() {
    const portal = document.getElementById('overlay-portal');
    if (!portal) return;

    const m = AppStore.modals;
    const post = AppStore.posts.find(p => p.id === AppStore.activePostId);
    
    // B"H - THE SENSITIVE HASH FIX
    // We include content-specific markers to trigger re-renders when data changes
    const currentHash = JSON.stringify({ 
        modals: m,
        activePostId: AppStore.activePostId,
        activeVerseId: AppStore.activeVerseId,
        // Listen to the count of comments to trigger injection/re-render
        commentCount: post ? (post.comments?.length || 0) : 0,
        activeChatId: AppStore.navigation.activeChatId,
        viewingUserId: AppStore.navigation.viewingUserId
    });

    if (currentHash !== lastOverlayHash) {
        const frag = document.createDocumentFragment();

        if (m.post) frag.appendChild(Architect.render(PostModal()));
        if (m.comments) frag.appendChild(CommentsOverlay()); 
        if (m.userList) frag.appendChild(UserListModal());
        if (m.chat) frag.appendChild(ChatOverlay());
        if (m.postMenu) frag.appendChild(PostMenu());
        if (m.readerView) frag.appendChild(ReaderView());
        
        portal.replaceChildren(frag);
        lastOverlayHash = currentHash;

        const hasOverlay = Object.values(m).some(v => v === true);
        document.body.style.overflow = hasOverlay ? 'hidden' : '';
        portal.style.pointerEvents = hasOverlay ? 'auto' : 'none';
    }
}
