// /BH/awtsmoos.com/geelooy/heichelos/post/comments/actions/menu.js
//B"H
import { deleteComment, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { handleUpload } from "./media.js";
import { handleReply } from "./reply.js";

export async function handleMenuOption(option, comment, el) {
    var post = window.post;
    var series = window.series;

    switch(option) {
        case "Edit": 
            alert("Editing requires a higher level of wisdom (Coming Soon)."); 
            break;
        case "Delete":
            if(!confirm("B\"H - Delete this insight forever?")) return;
            try {
                await deleteComment({
                    heichelId: post.heichel.id, parentType: "post", parentId: post.id,
                    seriesId: series.id, postId: post.id, aliasId: window.curAlias, commentId: comment.id
                });
                await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Deleted." });
                const domEl = document.querySelector(`.comment-content[data-cid="${comment.id}"]`);
                if(domEl) domEl.remove();
                if(window.reloadRoot) window.reloadRoot();
            } catch(e) {
                await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Error: " + e.message });
            }
            break;
        case "Play":
            var aud = document.querySelector("audio[data-awtsmoos-audio='" + comment.id + "'");
            if(!aud) return alert("No audio found.");
            if(!aud.paused) { 
                aud.pause(); 
                el.textContent = "Play"; 
            } else { 
                aud.play(); 
                el.textContent = "Pause"; 
            }
            break;
        case "Add Timesheet": 
            await handleUpload(comment, "timesheet"); 
            break;
        case "Add Audio": 
            await handleUpload(comment, "audio"); 
            break;
        case "Copy":
            try { 
                navigator.clipboard.writeText(comment?.content); 
                alert("Copied to clipboard.");
            } catch(e) { alert("Copy failed."); }
            break;
    }
}