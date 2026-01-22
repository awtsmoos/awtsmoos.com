//B"H
import { makeInfoHTML } from "/heichelos/post/postFunctions.js";

/**
 * @method populateRevelationTab
 * @description Manifests the "Lots of Options" inside the root sidebar tab.
 */
export function populateRevelationTab(actualTab, post, tabRefs) {
    if (!actualTab) return;
    actualTab.innerHTML = "";
    
    // 1. Info Cards
    actualTab.appendChild(makeInfoHTML());

    // 2. High-Intensity Action Portal
    const actionsArea = document.createElement("div");
    actionsArea.className = "post-root-actions";
    actionsArea.style.cssText = `
        margin-top: 40px; display: flex; flex-direction: column; gap: 15px; 
        border-top: 4px solid var(--color-ink); padding: 30px 10px 60px 10px;
    `;

    const createBtn = (txt, icon, onClick) => {
        const btn = document.createElement("button");
        btn.className = "awtsmoos-hero-btn";
        btn.style.width = "100%";
        btn.innerHTML = `<span style="font-size:20px;">${icon}</span> <span>${txt}</span>`;
        btn.onclick = onClick;
        return btn;
    };

    // Link the buttons to the tabs forged during bootstrap
    actionsArea.appendChild(createBtn("Insights & Comments", "💬", () => tabRefs.insights.open()));
    
    actionsArea.appendChild(createBtn("Consult AI Oracle", "✨", async () => {
         const { openAIChat } = await import("../../ai/chat.js");
         openAIChat();
    }));

    actionsArea.appendChild(createBtn("Saved Sparks", "🔖", () => tabRefs.bookmarks.open()));

    actualTab.appendChild(actionsArea);
}