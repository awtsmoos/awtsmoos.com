// B"H
/**
 * @module OwnerGovernance
 * @description
 * Chapter 2: The Button That Asked The Wrong Door.
 *
 * The owner controls are small vessels of permission. They reveal themselves
 * only when the current alias owns the Heichel. A single mistaken ascent in a
 * dynamic import once sent the browser into `modules/ui/modal.js`, a chamber
 * that does not exist, where the server could dress absence as JSON and the
 * module loader would recoil.
 *
 * Now every gateway points to the true modal at `modules/modal.js`. The
 * Awtsmoos has no body and no form, yet each finite route must wear its proper
 * garment: JavaScript as JavaScript, authority as authority, and creation as a
 * measured button in the hand of the owner.
 */

import { openModal } from "../../modal.js";
import { DOMElements } from "../../dom.js";
import { ScribeOfManifestation } from "../../engine/scribe-of-manifestation.js";
import * as api from "../../api.js";

/**
 * Renders owner-only governance controls into the Heichel UI.
 *
 * @param {Array<object>} breadcrumb - Current navigation breadcrumb.
 * @param {object} navigator - Heichel navigator with load/delete behavior.
 * @param {object} appState - Current ownership and location state.
 * @returns {void}
 */
export function renderOwnerControls(breadcrumb, navigator, appState) {
    if (!DOMElements.seriesControlsContainer) return;

    clearControlVessels();

    if (!appState.ownsIt) {
        hideControlsArea();
        return;
    }

    showControlsArea();
    renderSeriesCreationControls(navigator, appState);
    renderPostCreationControls(appState);
    renderExistingSeriesControls(breadcrumb, navigator, appState);
}

/**
 * Clears previous control DOM nodes before a fresh manifestation.
 *
 * @returns {void}
 */
function clearControlVessels() {
    DOMElements.seriesControlsContainer.innerHTML = "";
    if (DOMElements.postsControls) DOMElements.postsControls.innerHTML = "";
    if (DOMElements.seriesControls) DOMElements.seriesControls.innerHTML = "";
}

/** @returns {void} */
function hideControlsArea() {
    if (DOMElements.controlsArea) DOMElements.controlsArea.classList.add("hidden");
}

/** @returns {void} */
function showControlsArea() {
    if (DOMElements.controlsArea) DOMElements.controlsArea.classList.remove("hidden");
}

/**
 * Renders controls for creating a series and inviting an editor.
 *
 * @param {object} navigator - Heichel navigator.
 * @param {object} appState - Current state.
 * @returns {void}
 */
function renderSeriesCreationControls(navigator, appState) {
    const seriesBtnPlan = {
        tag: "div",
        attr: { class: "btn-group-governance" },
        children: [
            createBtnPlan("Submit New Series", () => openModal("series", navigator)),
            appState.currentSeries === "root"
                ? createBtnPlan("Invite Editor", () => ritualAddEditor(appState))
                : null
        ].filter(Boolean)
    };

    DOMElements.seriesControlsContainer.appendChild(
        ScribeOfManifestation.manifest(seriesBtnPlan)
    );
}

/**
 * Renders the post creation control.
 *
 * @param {object} appState - Current state.
 * @returns {void}
 */
function renderPostCreationControls(appState) {
    const postBtn = ScribeOfManifestation.manifest(createBtnPlan("Submit New Post", () => {
        window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, "_blank");
    }));

    if (!DOMElements.postsControls) return;
    DOMElements.postsControls.appendChild(postBtn);
    DOMElements.postsControls.classList.remove("hidden");
}

/**
 * Renders edit/delete controls for non-root series.
 *
 * @param {Array<object>} breadcrumb - Current breadcrumb.
 * @param {object} navigator - Heichel navigator.
 * @param {object} appState - Current state.
 * @returns {void}
 */
function renderExistingSeriesControls(breadcrumb, navigator, appState) {
    if (appState.currentSeries === "root" || !DOMElements.seriesControls) return;

    const editPlan = {
        tag: "div",
        attr: { class: "btn-group-row" },
        children: [
            createBtnPlan("Edit Series", () => openModal("series", navigator, {
                mode: "edit",
                seriesId: appState.currentSeries,
                title: breadcrumb[breadcrumb.length - 1]?.name || ""
            })),
            createBtnPlan("Destroy Series", () => {
                const parent = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : { id: "root" };
                navigator.deleteSingleItem({
                    id: appState.currentSeries,
                    type: "series",
                    parentId: parent.id
                });
            }, "danger")
        ]
    };

    DOMElements.seriesControls.appendChild(ScribeOfManifestation.manifest(editPlan));
}

/**
 * Creates a button blueprint for the manifestation engine.
 *
 * @param {string} text - Visible button text.
 * @param {Function} onClick - Click ritual.
 * @param {string} [className=""] - Extra CSS class.
 * @returns {object} Button blueprint.
 */
function createBtnPlan(text, onClick, className = "") {
    return {
        tag: "button",
        attr: { class: `awtsmoos-btn ${className}` },
        children: [text],
        events: {
            click: event => {
                event.preventDefault();
                onClick();
            }
        }
    };
}

/**
 * Prompts for an editor alias and submits the governance mutation.
 *
 * @param {object} appState - Current state.
 * @returns {Promise<void>} Resolves after optional editor invitation.
 */
async function ritualAddEditor(appState) {
    if (!window.AwtsmoosPrompt) return;

    const editorNm = await window.AwtsmoosPrompt.go({
        headerTxt: "Identify the Editor's Alias"
    });

    if (!editorNm) return;

    await api.addEditor({
        heichelId: appState.heichelData.id,
        aliasId: window.curAlias,
        editorAliasId: editorNm
    });
}
