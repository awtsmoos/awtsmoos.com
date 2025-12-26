//B"H
import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { addTab, makeInfoHTML, makeNavBars, interpretPostDayuh, appendHTML } from "/heichelos/post/postFunctions.js";
import { loadRootComments, init } from "/heichelos/post/commentLogic.js";
import { loadInitial } from "./api.js";

/**
 * Checks if the user has edit authority over the Heichel.
 */
export async function hasHeichelAuthority(heichel, alias) {
    if (!alias) return false;
    const res = await fetch(`/api/social/alias/${alias}/heichelos/${heichel}/ownership`);
    const json = await res.json();
    return !!json.yes;
}

/**
 * B"H - The Point of Inception for the reader experience.
 */
export async function startItAll() {
    console.log("%c B\"H - Reader Core Engaging", "color: #ccff00; background: #000; font-weight: bold;");
    
    const sidebar = document.querySelector(".sidebar");
    const realPost = document.querySelector("#realPost");

    try {
        const data = await loadInitial();
        const { post, series, heichel, indexInSeries } = data;
        
        const curAlias = window.curAlias;
        window.doesOwn = await hasHeichelAuthority(heichel, curAlias);

        if (post) {
            const heichelDetails = await getHeichelDetails(heichel);
            post.heichel = { id: heichel, ...heichelDetails };
            
            const aliasDetails = await getAliasName(post.author);
            window.alias = window.aliasDetails = { id: post.author, ...aliasDetails };

            // Initialize Sidebar Stack
            if (sidebar) {
                const rootTab = addTab({
                    header: "Post Details",
                    name: "postInfo",
                    async onopen({ actualTab }) {
                        actualTab.innerHTML = "";
                        actualTab.appendChild(makeInfoHTML());
                        
                        const btn = document.createElement("button");
                        btn.className = "awtsmoos-hero-btn";
                        btn.innerHTML = `<span>💬 View Comments</span>`;
                        btn.onclick = () => {
                            addTab({
                                header: "Comments",
                                name: "comments",
                                async onopen({ actualTab: comTab, tab: t }) {
                                    comTab.innerHTML = "<div style='padding:20px; text-align:center'>Loading...</div>";
                                    await loadRootComments({ post, parent: comTab, tab: t });
                                    await init({ post, parent: comTab, tab: t });
                                }
                            }).open();
                        };
                        actualTab.appendChild(btn);
                    }
                });
                rootTab.open();
            }

            // Render Post
            if (realPost) {
                realPost.innerHTML = "";
                if (post.content) appendHTML(post.content, realPost);
                if (post.dayuh) await interpretPostDayuh(post);
                appendHTML(makeNavBars(post, series, indexInSeries), realPost);
            }
        }
    } catch (e) {
        console.error("FATAL B\"H ERROR:", e);
        if (realPost) realPost.innerHTML = `<div style="padding:20px; color:red;">B"H - Encountered an issue loading the light: ${e.message}</div>`;
    }
}