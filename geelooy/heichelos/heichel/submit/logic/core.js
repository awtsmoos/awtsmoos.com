//B"H
import { makePost, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { getEditorContent } from "./editor.js";
import { getAllSectionsData } from "./sections.js";

export function initializeSubmitCore() {
    const aliasIdDiv = document.getElementById("aliasId");
    const backBtn = document.getElementById("backBtn");
    
    // URL Parsing
    const u = new URL(location);
    const parentSeriesId = u.searchParams.get("parentSeriesId") || "root";
    const heichelId = (p => p[p.length - 2])(location.pathname.split("/"));
    
    // Back Button Logic
    const returnURL = u.searchParams.get("returnURL");
    const baseURL = `/heichelos/${heichelId}?${new URLSearchParams({ view: "posts", series: parentSeriesId })}`;
    
    if (backBtn) {
        backBtn.href = returnURL || baseURL;
    }

    // Alias Handling
    window.curAlias = window.curAlias || "";
    if (aliasIdDiv) aliasIdDiv.value = window.curAlias;

    addEventListener("awtsmoosAliasChange", e => {
        window.curAlias = e.detail.id;
        if (aliasIdDiv) aliasIdDiv.value = window.curAlias;
    });

    // Attach Submit Handler
    const submitBtn = document.getElementById("submitPost");
    if (submitBtn) {
        submitBtn.onclick = () => handleSubmit(heichelId, parentSeriesId);
    }

    return { heichelId, parentSeriesId };
}

async function handleSubmit(heichelId, parentSeriesId) {
    const titleVal = document.getElementById("title").value.trim();
    const aliasVal = document.getElementById("aliasId").value;

    if (!titleVal) return alert("Title is required!");
    if (!aliasVal) return alert("Alias ID missing. Please log in.");

    const mainEditor = document.getElementById("mainContentEditor");
    const mainContent = getEditorContent(mainEditor);
    const sections = getAllSectionsData();

    const payload = {
        aliasId: aliasVal,
        heichelId,
        parentSeriesId,
        title: titleVal,
        mainContent: {
            html: mainContent.html,
            images: mainContent.images
        },
        dayuh: { sections }
    };

    try {
        const response = await makePost(payload);
        if (response.success) {
            await AwtsmoosPrompt.go({
                isAlert: true,
                headerTxt: "SUCCESS!",
                bodyTxt: "Your insane post has been launched!"
            });
            // Go back
            const backBtn = document.getElementById("backBtn");
            location.href = backBtn ? backBtn.href : `/heichelos/${heichelId}`;
        } else {
            throw new Error(response.error || "Unknown server error");
        }
    } catch (e) {
        AwtsmoosPrompt.go({
            isAlert: true,
            headerTxt: "Submission Failed",
            bodyTxt: e.message
        });
        console.error(e);
    }
}
