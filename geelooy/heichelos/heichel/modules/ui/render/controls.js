// B"H
/**
 * @module OwnerGovernance
 * @description
 * Chapter 291: Governance buttons no longer burn the chamber with strings.
 *
 * Owner controls are cleared with DOM replacement, not HTML reparsing. The
 * buttons are manifested in fragments and all modal paths remain pointed at
 * the true modal vessel.
 */

import { openModal } from '../../modal.js';
import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import * as api from '../../api.js';

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

function clearControlVessels() {
    DOMElements.seriesControlsContainer?.replaceChildren();
    DOMElements.postsControls?.replaceChildren();
    DOMElements.seriesControls?.replaceChildren();
}

function hideControlsArea() {
    DOMElements.controlsArea?.classList.add('hidden');
}

function showControlsArea() {
    DOMElements.controlsArea?.classList.remove('hidden');
}

function renderSeriesCreationControls(navigator, appState) {
    const plan = {
        tag: 'div',
        attr: { class: 'btn-group-governance' },
        children: [
            createBtnPlan('Submit New Series', () => openModal('series', navigator)),
            appState.currentSeries === 'root' ? createBtnPlan('Invite Editor', () => ritualAddEditor(appState)) : null
        ].filter(Boolean)
    };
    DOMElements.seriesControlsContainer.appendChild(ScribeOfManifestation.manifest(plan));
}

function renderPostCreationControls(appState) {
    if (!DOMElements.postsControls) return;
    const postBtn = ScribeOfManifestation.manifest(createBtnPlan('Submit New Post', () => {
        window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
    }));
    DOMElements.postsControls.appendChild(postBtn);
    DOMElements.postsControls.classList.remove('hidden');
}

function renderExistingSeriesControls(breadcrumb, navigator, appState) {
    if (appState.currentSeries === 'root' || !DOMElements.seriesControls) return;
    const editPlan = {
        tag: 'div',
        attr: { class: 'btn-group-row' },
        children: [
            createBtnPlan('Edit Series', () => openModal('series', navigator, {
                mode: 'edit',
                seriesId: appState.currentSeries,
                title: breadcrumb[breadcrumb.length - 1]?.name || ''
            })),
            createBtnPlan('Destroy Series', () => {
                const parent = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : { id: 'root' };
                navigator.deleteSingleItem({ id: appState.currentSeries, type: 'series', parentId: parent.id });
            }, 'danger')
        ]
    };
    DOMElements.seriesControls.appendChild(ScribeOfManifestation.manifest(editPlan));
}

function createBtnPlan(text, onClick, className = '') {
    return {
        tag: 'button',
        attr: { class: `awtsmoos-btn ${className}`.trim(), type: 'button' },
        children: [text],
        events: {
            click: event => {
                event.preventDefault();
                onClick();
            }
        }
    };
}

async function ritualAddEditor(appState) {
    if (!window.AwtsmoosPrompt) return;
    const editorNm = await window.AwtsmoosPrompt.go({ headerTxt: "Identify the Editor's Alias" });
    if (!editorNm) return;
    await api.addEditor({
        heichelId: appState.heichelData.id,
        aliasId: window.curAlias,
        editorAliasId: editorNm
    });
}
