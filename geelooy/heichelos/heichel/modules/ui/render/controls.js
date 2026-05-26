
/**
 * B"H
 * @module OwnerGovernance
 * @description
 * This module manifests the buttons of authority (Gevurah). 
 * These vessels are created only when the observer's spark matches 
 * the owner of the Realm. All buttons are manifest from JSON plans.
 */

import { openModal } from '../../modal.js';
import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import * as api from '../../api.js';

/**
 * @function renderOwnerControls
 * @description Manifests the buttons of creation and deletion.
 */
export function renderOwnerControls(breadcrumb, navigator, appState) {
    if (!DOMElements.seriesControlsContainer) return;
    
    // Purify the existing vessels
    DOMElements.seriesControlsContainer.innerHTML = "";
    if (DOMElements.postsControls) DOMElements.postsControls.innerHTML = "";
    if (DOMElements.seriesControls) DOMElements.seriesControls.innerHTML = "";

    if (!appState.ownsIt) {
        if (DOMElements.controlsArea) DOMElements.controlsArea.classList.add("hidden");
        return;
    }

    if (DOMElements.controlsArea) DOMElements.controlsArea.classList.remove("hidden");

    // 1. Blueprint for Series Governance
    const seriesBtnPlan = {
        tag: 'div',
        attr: { class: 'btn-group-governance' },
        children:[
            createBtnPlan("Submit New Series", () => import('../modal.js').then(m => m.openModal('series', navigator))),
            appState.currentSeries === 'root' ? createBtnPlan("Invite Editor", () => ritualAddEditor(appState)) : null
        ].filter(Boolean)
    };

    // 2. Blueprint for Post Governance
    const postBtnPlan = createBtnPlan("Submit New Post", () => {
        window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
    });

    // 3. Manifestation into the physical world
    const seriesBtns = ScribeOfManifestation.manifest(seriesBtnPlan);
    const postBtn = ScribeOfManifestation.manifest(postBtnPlan);

    DOMElements.seriesControlsContainer.appendChild(seriesBtns);
    if (DOMElements.postsControls) {
        DOMElements.postsControls.appendChild(postBtn);
        DOMElements.postsControls.classList.remove("hidden");
    }

    // 4. Ritual specific to an existing Series (Non-root)
    if (appState.currentSeries !== 'root' && DOMElements.seriesControls) {
        const editPlan = {
            tag: 'div',
            attr: { class: 'btn-group-row' },
            children:[
                createBtnPlan("Edit Series", () => openModal("series", navigator, { mode: "edit", seriesId: appState.currentSeries, title: breadcrumb[breadcrumb.length - 1]?.name || "" })),
                createBtnPlan("Destroy Series", () => {
                    const parent = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : { id: 'root' };
                    navigator.deleteSingleItem({ id: appState.currentSeries, type: 'series', parentId: parent.id });
                }, "danger")
            ]
        };
        DOMElements.seriesControls.appendChild(ScribeOfManifestation.manifest(editPlan));
    }
}

/**
 * @private
 * @function createBtnPlan
 */
function createBtnPlan(text, onClick, className = "") {
    return {
        tag: 'button',
        attr: { class: `awtsmoos-btn ${className}` },
        children: [text],
        events: {
            click: (e) => {
                e.preventDefault();
                onClick();
            }
        }
    };
}

/**
 * @private
 * @function ritualAddEditor
 */
async function ritualAddEditor(appState) {
    if (!window.AwtsmoosPrompt) return;
    const editorNm = await window.AwtsmoosPrompt.go({ headerTxt: "Identify the Editor's Alias" });
    if (editorNm) {
        await api.addEditor({
            heichelId: appState.heichelData.id,
            aliasId: window.curAlias,
            editorAliasId: editorNm
        });
    }
}
