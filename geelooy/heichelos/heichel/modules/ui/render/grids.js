
/**
 * B"H
 * @module GridManifest
 * @description
 * The grids organize the sparks of content (Posts and Series). 
 * Every card is manifest through the Divine Blueprint.
 */

import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import { showContextMenu } from '../contextmenu.js';
import { getItemKey } from '../../state.js';
import { socialActionBlueprints } from './social-actions.js';
import { openRecordVessel } from '../../navigator/content-normalizer.js';

/**
 * @function renderContentGrids
 * @description Manifests all content grids for the current Realm coordinates.
 */
export function renderContentGrids(content, navigator, appState) {
    manifestSpecificGrid(content.posts, DOMElements.postsList, 'post', navigator, appState);
    manifestSpecificGrid(content.subSeries, DOMElements.seriesList, 'series', navigator, appState);
}

/**
 * @private
 * @function manifestSpecificGrid
 */
function manifestSpecificGrid(items, container, type, navigator, appState) {
    if (!container) return;
    container.innerHTML = "";

    if (!items || items.length === 0) {
        const emptyMsg = ScribeOfManifestation.speakElement({
            tag: 'div',
            attr: { class: 'empty-glow-msg' },
            children: [`The realm of ${type}s is currently silent.`]
        });
        container.appendChild(emptyMsg);
        return;
    }

    items.forEach(item => {
        const cardBlueprint = getCardBlueprint(item, type, navigator, appState);
        const cardVessel = ScribeOfManifestation.speakElement(cardBlueprint);
        container.appendChild(cardVessel);
    });
}

/**
 * @private
 * @function getCardBlueprint
 */
function getCardBlueprint(item, type, navigator, appState) {
    const data = openRecordVessel(type === 'post' ? item : (item.prateem || item)) || {};
    const id = data.id || data.postId || data.seriesId || data.inputId || item.id || item.postId || item.seriesId;
    const title = data.title || data.name || data.id || id || "Hidden Insight";
    const desc = (data.content || data.description || "").substring(0, 150);
    const isSelected = appState.selectedItems.has(getItemKey({ id, type }));
    const socialItem = { ...item, ...data, id, title };

    return {
        tag: 'div',
        attr: { 
            class: `card-wrapper awtsmoos-card ${isSelected ? 'selected' : ''}`,
            'data-id': id,
            'data-type': type
        },
        events: {
            click: (e) => handleCardSelectionOrNav(e, { id, type, title, index: item.indexInSeries }, navigator, appState)
        },
        children:[
            appState.ownsIt ? {
                tag: 'div',
                attr: { class: 'card-menu-spark' },
                children: ['⋮'],
                events: {
                    click: (e) => {
                        e.stopPropagation();
                        showContextMenu(e.target, { id, type, parentId: appState.currentSeries, title }, navigator);
                    }
                }
            } : null,
            {
                tag: 'div',
                attr: { class: `post-card ${type}` },
                children:[
                    { tag: 'h2', children: [title] },
                    { tag: 'p', children: [desc + (desc.length >= 150 ? "..." : "")] },
                    ...(type === 'post' ? socialActionBlueprints(socialItem, appState) : [])
                ]
            }
        ].filter(Boolean)
    };
}

/**
 * @private
 * @function handleCardSelectionOrNav
 */
function handleCardSelectionOrNav(e, item, navigator, appState) {
    if (appState.isSelectionMode) {
        import('../controls.js').then(m => m.toggleItemSelection(item, appState));
    } else {
        if (item.type === 'series') {
            navigator.navigateTo(item.id);
        } else {
            const hId = appState.heichelId;
            const sId = appState.currentSeries;
            const pId = item.index !== undefined ? item.index : item.id;
            window.location.href = `/heichelos/${hId}/series/${sId}/${pId}`;
        }
    }
}
