
/**
 * B"H
 * @module VerseMenu
 * @chapter The Gateway of the Sigil
 * @description
 * When a Seeker clicks upon the floating Verse Number (The Sigil), 
 * this class summons an intensely styled, high-impact Context Menu 
 * providing absolute control over that specific coordinate in the Text.
 * 
 * FIX: Absolute clientX/clientY fixed positioning.
 */

import { copyToClipboard, updateQueryStringParameter } from "../utils.js";
import { makeToast } from "../ui.js";

export class AwtsmoosVerseMenu {
    /**
     * @method summon
     * @description Materializes the insane context menu at the precise cursor coordinates.
     */
    static summon(e, idx) {
        e.preventDefault();
        e.stopPropagation();

        // Annihilate any previous manifestations
        const old = document.getElementById("insane-verse-menu");
        if (old) old.remove();

        const menu = document.createElement("div");
        menu.id = "insane-verse-menu";
        menu.className = "insane-verse-context-menu";
        
        // B"H - PERFECT GEOMETRIC ANCHORING
        menu.style.position = 'fixed';
        menu.style.zIndex = '99999999';
        
        // Calculate boundaries against the viewport
        const menuWidth = 320; 
        const menuHeight = 350; 
        
        let safeX = e.clientX + 10;
        let safeY = e.clientY + 10;

        if (safeX + menuWidth > window.innerWidth) safeX = window.innerWidth - menuWidth - 20;
        if (safeY + menuHeight > window.innerHeight) safeY = window.innerHeight - menuHeight - 20;

        menu.style.left = `${safeX}px`;
        menu.style.top = `${safeY}px`;

        const actions = {
            "🔗 Copy Link to Verse": () => {
                const url = new URL(window.location);
                url.searchParams.set("idx", idx);
                url.searchParams.delete("sub");
                copyToClipboard({ text: url.href, successMsg: "Link to Verse Anchored!" }, makeToast);
            },
            "📝 Copy Section Text": () => {
                if (window.sectionDayuh && window.sectionDayuh[idx]) {
                    const sec = window.sectionDayuh[idx];
                    const txt = Array.isArray(sec) ? sec.join("\n\n") : sec;
                    copyToClipboard({ text: txt, successMsg: "Text Extracted!" }, makeToast);
                }
            },
            "👁️ Open Insights Sidebar": async () => {
                updateQueryStringParameter("idx", idx);
                updateQueryStringParameter("sub", null);
                if (window.openPanelToComments) {
                    await window.openPanelToComments();
                    if (window.commentLogic?.reloadRoot) await window.commentLogic.reloadRoot();
                }
            },
            "📜 View Inline Commentaries": async () => {
                const inlineModule = await import("../../comments/inline.js");
                const targetEl = document.querySelector(`.section[data-awtsmoos-idx="${idx}"]`);
                await inlineModule.showSectionCommentaryInline(idx, null, targetEl);
            }
        };

        const header = document.createElement("div");
        header.className = "insane-verse-menu-header";
        header.innerText = `Verse ${parseInt(idx) + 1} Actions`;
        menu.appendChild(header);

        Object.entries(actions).forEach(([label, action]) => {
            const btn = document.createElement("button");
            btn.className = "insane-verse-menu-item";
            btn.innerText = label;
            btn.onclick = (event) => {
                event.stopPropagation();
                action();
                menu.remove();
            };
            menu.appendChild(btn);
        });

        // B"H - Appended to document.body to escape ALL relative parents
        document.body.appendChild(menu);

        // Self-destruction listener
        const killMenu = (clickEvent) => {
            if (!menu.contains(clickEvent.target)) {
                menu.remove();
                document.removeEventListener('click', killMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', killMenu), 10);
    }
}
