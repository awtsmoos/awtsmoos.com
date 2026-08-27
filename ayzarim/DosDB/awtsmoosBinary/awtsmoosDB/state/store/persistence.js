
// B"H
/**
 * @module Persistence
 * @description
 * The Divine Memory (Reshimu) of the Application.
 *
 * This module ensures that the state manifested by the user is preserved 
 * within the physical vessel of the browser's storage. It handles the 
 * conversion between complex JS objects (like Sets) and simple JSON,
 * ensuring the "Trace" of creation remains even after the light is 
 * temporarily withdrawn.
 */
export const Persistence = {
    save(store) {
        const data = {
            posts: store.posts,
            stories: store.stories,
            collections: store.collections,
            spaces: store.spaces,
            chats: store.chats,
            notifications: store.notifications,
            // Convert Sets to Arrays for serialization
            followingIds: Array.from(store.followingIds),
            savedPostIds: Array.from(store.savedPostIds),
            currentUser: store.currentUser,
            userCoverPhoto: store.userCoverPhoto,
            settings: store.settings
        };
        try {
            localStorage.setItem('awtsmoos_social_v5', JSON.stringify(data));
        } catch(e) {
            console.error("B\"H - Memory full, could not save state", e);
        }
    },

    load() {
        try {
            const saved = localStorage.getItem('awtsmoos_social_v5');
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            
            // Resurrect Arrays back into Sets
            parsed.followingIds = new Set(parsed.followingIds || []);
            parsed.savedPostIds = new Set(parsed.savedPostIds || []);
            
            return parsed;
        } catch (e) {
            console.error("B\"H - Memory corrupted, starting fresh", e);
            return null;
        }
    }
};
