
/**
 * B"H
 * @module MenuActions
 * @chapter Deciphering the Sigil
 */

import { deleteComment, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { handleUpload } from "./media.js";

/**
 * @function handleMenuOption
 * @description Executes the seeker's command within the comment menu.
 */
export async function handleMenuOption(option, comment, el) {
    const { post, series } = window;
    if (!post || !series) return;

    switch(option) {
        case "Copy":
            try { 
                await navigator.clipboard.writeText(comment?.content || ""); 
                alert("B\"H - The Word has been copied to your scroll.");
            } catch(e) { alert("Problem copying!"); }
            break;

        case "Delete":
            if(!confirm("B\"H - Are you certain you wish to return this insight to the void?")) return;
            try {
                const res = await deleteComment({
                    heichelId: post.heichel.id, 
                    parentType: "post", 
                    parentId: post.id,
                    seriesId: series.id, 
                    postId: post.id, 
                    aliasId: window.curAlias, 
                    commentId: comment.id
                });
                if(res.success) {
                    const domEl = document.querySelector(`[data-cid="${comment.id}"]`);
                    if(domEl) domEl.closest('.comment-wrapper, .inline-comment')?.remove();
                }
            } catch(e) { alert("Destruction resisted: " + e.message); }
            break;
            
        case "Reply":
            const { handleReply } = await import("../render/actions.js");
            const container = el.closest('.comment-content, .inline-comment');
            if(container) handleReply(comment, container);
            break;

        case "Add Audio":
            await handleUpload(comment, "audio");
            break;
    }
}
