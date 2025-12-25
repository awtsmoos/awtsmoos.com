
//B"H
import { getHeichelDetails, getAliasName } from "/scripts/awtsmoos/api/utils.js";
import { addTab, makeInfoHTML, makeNavBars, interpretPostDayuh, appendHTML } from "/heichelos/post/postFunctions.js"
import { loadRootComments, init } from "/heichelos/post/commentLogic.js"
import { loadInitial, fetchAwtsmoos } from "./api.js";
import { renderFootnotesPanel } from "/heichelos/post/comments/panel/footnotes.js";

export async function hasHeichelAuthority(heichel, alias) {
	return !!(await (await fetch(`/api/social/alias/${alias}/heichelos/${heichel}/ownership`)).json()).yes
}

export async function startItAll() {
	console.log("%c B\"H - startItAll executing", "background: #2196f3; color: white; font-size: 20px; padding: 10px; border-radius: 5px;");
	
    // Query elements inside the function to ensure DOM is ready
    var sidebar = document.querySelector(".sidebar");
    var realPost = document.querySelector("#realPost");

	const data = await loadInitial();
	console.log("%c B\"H - Initial Data Loaded:", "color: #2196f3;", data);

    var post = data.post;
    var series = data.series;
    var heichel = data.heichel;
    var indexInSeries = data.indexInSeries;
    
	var curAlias = window.curAlias;
	var doesOwn = await hasHeichelAuthority(heichel, curAlias);
	window.doesOwn = doesOwn;

	if (post) {
		console.log("%c B\"H - Post found, initializing UI", "color: #4caf50;");
		var heichelDetails = await getHeichelDetails(heichel)
		post.heichel = { id: heichel, ...heichelDetails };
		
		window.post = post;
		var aliasDetails = await getAliasName(post.author)
		window.alias = window.aliasDetails = window.author = { id: post.author, ...aliasDetails };

        // Reference the containers from the TabManager
        // IMPORTANT: We open the "Info" tab first as the Root.
		console.log("%c B\"H - Adding Root Info Tab", "color: #ff9800;");
		
        if (sidebar) {
            const rootTab = addTab({
                header: "Post Info",
                name: "postInfo",
                rootParent: sidebar,
                async onopen({ actualTab }) {
                    actualTab.innerHTML = "";
                    
                    // 1. Post Details
                    var html = makeInfoHTML();
                    if(typeof html === 'string') actualTab.innerHTML = html;
                    else actualTab.appendChild(html);
                    
                    // 2. Navigation to Comments
                    const btn = document.createElement("button");
                    btn.className = "awtsmoos-hero-btn";
                    btn.innerHTML = `<span>💬 View Comments</span>`;
                    btn.onclick = () => {
                        // Push Comment View onto Stack
                        window.commentTab = addTab({
                            header: "Comments",
                            name: "comments",
                            async onopen({ actualTab: comTab, tab: t }) {
                                comTab.innerHTML = "<div style='padding:20px; text-align:center'>Loading...</div>";
                                try {
                                    await loadRootComments({ post, mainParent: window.tabManager.tabHolder, parent: comTab, tab: t });
                                    
                                    // Initialize Logic Context
                                    await init({ 
                                        post, 
                                        mainParent: window.tabManager.tabHolder, 
                                        parent: comTab, 
                                        tab: t 
                                    });
                                } catch(e) {
                                    console.error("Error loading comments:", e);
                                    comTab.innerText = "Error loading comments.";
                                }
                            }
                        });
                        window.commentTab.open();
                    };
                    actualTab.appendChild(btn);

                    // 3. Navigation to Footnotes (Only if they exist)
                    if(window.post?.dayuh?.footnotes?.length) {
                        const ftBtn = document.createElement("button");
                        ftBtn.className = "awtsmoos-hero-btn";
                        ftBtn.style.marginTop = "10px";
                        ftBtn.innerHTML = `<span>📖 View Footnotes</span>`;
                        ftBtn.onclick = () => {
                            window.tabManager.addTab({
                                header: "Footnotes",
                                name: "footnotes",
                                onopen({ actualTab }) {
                                    renderFootnotesPanel(actualTab);
                                }
                            }).open();
                        };
                        actualTab.appendChild(ftBtn);
                    }
                }
            });
            
            // Push the root tab to the stack, making it ready.
            // B"H - Sidebar remains hidden via CSS class 'hidden-comments' until clicked.
            rootTab.open();
        } else {
            console.error("B\"H - Sidebar element not found in DOM");
        }
		
		// Rendering Main Post Content
		var navHtml = makeNavBars(post, series, indexInSeries)
		var ct = post.content;
		if(realPost) {
			realPost.innerHTML = "";
			if (ct) appendHTML(ct, realPost);
			if (post.dayuh) await interpretPostDayuh(post);
			appendHTML(navHtml, realPost);
			console.log("%c B\"H - Main Post Content Rendered", "color: #4caf50;");
		}
		
	} else {
		console.error("%c B\"H - Failed to load post data", "background: red; color: white;");
		if(realPost) realPost.innerHTML = "Couldn't load post. B\"H";
	}
}
