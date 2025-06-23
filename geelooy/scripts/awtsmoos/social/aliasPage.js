// B"H
//================================================================================================
//
//  THE FINAL MANUSCRIPT - ATONEMENT (REPAIRED & ENHANCED)
//
//  This version corrects the critical navigation bug by tracking the origin column of a click.
//  It also introduces more robust column management and significant UX/CSS improvements
//  for a more stable, intuitive, and polished user experience.
//
//================================================================================================

import {getHeichelosOfPostsOfAlias, getPostsOfAliasInSeries} from "/scripts/awtsmoos/api/social/alias.js";

console.log('B"H - The Final Manuscript (Repaired) Loaded\n');

class AliasPageNavigator {

    constructor({details, container}) {
        this.aliasDetails = details;
        this.container = container;
        this.uniqueId = 'alias-page-hyper-instance-' + Date.now();

        this.state = this._getDefaultState();
        this.apiCache = new Map();

        this._bindMethods();
        this._initialize();
    }

    _getDefaultState() {
        return {
            heichel: null,
            path: [],
        };
    }

    _bindMethods() {
        this._handleItemClick = this._handleItemClick.bind(this);
        this._handlePopState = this._handlePopState.bind(this);
        this._handleTimelineClick = this._handleTimelineClick.bind(this);
        this._pruneFutureColumns = this._pruneFutureColumns.bind(this);
    }

    async _initialize() {
        this.container.className = `alias-page-scope ${this.uniqueId}`;
        this._setupDOM();
        this._bindEvents();
        
        try {
            await this._updateView();
            // Initial render of the first column
            await this._restoreStateFromURL();
        } catch (error) {
            console.error("Initialization failed:", error);
            this.navigatorBody.innerHTML = '';
            this.navigatorBody.appendChild(this._createElement('div', ['error-message'], ['Fatal Error: Could not initialize the page. Please refresh.']));
        }
    }

    _setupDOM() {
        const homeBtn = this._createElement('button', ['home-button'], [this.aliasDetails.name], {
            'data-level': '-1'
        });
        this.timeline = this._createElement('div', ['timeline']);
        this.header = this._createElement('div', ['alias-header'], [homeBtn, this.timeline]);
        this.navigatorBody = this._createElement('div', ['navigator-body']);
        const navigator = this._createElement('div', ['alias-navigator'], [this.navigatorBody]);
        this.container.replaceChildren(this.header, navigator);
    }

    _bindEvents() {
        this.navigatorBody.addEventListener('click', this._handleItemClick);
        this.header.addEventListener('click', this._handleTimelineClick);
        window.addEventListener('popstate', this._handlePopState);
    }

    // --- VIEW & STATE MANAGEMENT ---

        async _updateView(isRestoring=false) {
        if (!isRestoring) {
            this._updateURL();
        }

        const activeColumnIndex = this.state.heichel ? this.state.path.length + 1 : 0;

        this._renderTimeline();
        
        // This is the line to change:
        await this._pruneFutureColumns(activeColumnIndex); // Add 'await' here

        this.navigatorBody.style.setProperty('--focus-index', activeColumnIndex);

        if (!this.navigatorBody.querySelector(`[data-column-index="${activeColumnIndex}"]`)) {
            await this._createAndRenderColumn(activeColumnIndex);
        }
    }

    _renderTimeline() {
        const pathItems = [this.state.heichel, ...this.state.path].filter(Boolean);
        const timelineFragment = document.createDocumentFragment();

        if (pathItems.length > 0) {
            timelineFragment.appendChild(this._createElement('span', ['timeline-chevron'], ['›']));
        }

        pathItems.forEach( (item, index) => {
            const el = this._createElement('button', ['timeline-item'], [item.name], {
                'data-level': index
            });
            // Style the last item in the breadcrumb trail differently
            if (index === pathItems.length - 1) {
                el.classList.add('is-current-step');
            }
            timelineFragment.appendChild(el);
        }
        );

        this.timeline.replaceChildren(timelineFragment);
    }

    // FIX: Replaced prune logic to be more robust. It now removes columns that are "in the future"
    // relative to the new navigation state, which is more predictable.
    // The critical change is removing the column immediately instead of waiting for an animation.
       // FIX: This version is now async and returns a Promise that resolves
    // after all "future" columns have been fully removed from the DOM.
    // This solves the race condition where the view would update before
    // the columns were gone.
    _pruneFutureColumns(activeIndex) {
        return new Promise(resolve => {
            const columnsToRemove = Array.from(this.navigatorBody.querySelectorAll('.navigator-column'))
                .filter(col => {
                    const colIndex = parseInt(col.dataset.columnIndex, 10);
                    return colIndex >= activeIndex;
                });

            if (columnsToRemove.length === 0) {
                return resolve();
            }

            let columnsAnimated = 0;
            const onAnimationEnd = () => {
                columnsAnimated++;
                if (columnsAnimated === columnsToRemove.length) {
                    resolve();
                }
            };

            columnsToRemove.forEach(col => {
                // We add the listener before the class to catch all cases.
                // The { once: true } option is crucial.
                col.addEventListener('animationend', () => {
                    col.remove();
                    onAnimationEnd();
                }, { once: true });
                
                col.classList.add('is-collapsing');

                // Fallback timer: If there's no animation or it fails,
                // remove the element after a short delay to prevent it from getting stuck.
                setTimeout(() => {
                    if (document.body.contains(col)) {
                        col.remove();
                        onAnimationEnd();
                    }
                }, 300); // 300ms should be longer than your CSS animation
            });
        });
    }

    // --- DATA FLOW ---

    async _createAndRenderColumn(columnIndex) {
        const columnEl = this._createElement('div', ['navigator-column'], [], {
            'data-column-index': columnIndex
        });
        const columnInner = this._createElement('div', ['column-inner']);

        const placeholderHeader = this._createColumnHeader(columnIndex, null, true);
        const skeletonLoader = this._createElement('div', ['skeleton-loader']);
        columnInner.append(placeholderHeader, skeletonLoader);
        columnEl.appendChild(columnInner);

        this.navigatorBody.appendChild(columnEl);

        try {
            const data = await this._getDataForColumn(columnIndex);
            const realHeader = this._createColumnHeader(columnIndex, data, false);
            const listContainer = this._renderItemsToList(data, columnIndex);

            columnInner.replaceChildren(realHeader, listContainer);
        } catch (error) {
            console.error(`FATAL: Column ${columnIndex} failed to render:`, error);
            const errorHeader = this._createColumnHeader(columnIndex, {
                error: true
            }, true);
            const errorMsg = this._createElement('div', ['error-message'], [error.message]);
            columnInner.replaceChildren(errorHeader, errorMsg);
        }
    }

    async _getDataForColumn(columnIndex) {
        const isHeichelos = columnIndex === 0;
        let heichel, pathForApi, pathStr;

        if (columnIndex > 0) {
            if (!this.state.heichel?.id)
                throw new Error("Heichel context is missing. Cannot fetch data.");
            heichel = this.state.heichel;
            pathForApi = this.state.path.slice(0, columnIndex - 1);
            pathStr = `root/${pathForApi.map(p => p.id).join('/')}`;
        } else {
            pathStr = 'heichelos';
        }

        const cacheKey = isHeichelos ? 'heichelos' : `${this.aliasDetails.id}:${heichel.id}:${pathStr}`;
        if (this.apiCache.has(cacheKey)) {
            return this.apiCache.get(cacheKey);
        }

        const fetchPromise = isHeichelos ? getHeichelosOfPostsOfAlias({
            aliasId: this.aliasDetails.id
        }) : getPostsOfAliasInSeries({
            aliasId: this.aliasDetails.id,
            heichelId: heichel.id,
            path: pathStr
        });

        const data = await this._unwrapApiResponse(fetchPromise);
        this.apiCache.set(cacheKey, data);

        // Update placeholder name in timeline after fetch
        if (columnIndex > 0 && this.state.path[columnIndex - 1]) {
            const parentData = this.apiCache.get(this._getCacheKeyForIndex(columnIndex - 1));
            const currentPathItem = this.state.path[columnIndex - 1];
            if (parentData?.series && currentPathItem) {
                const fullItemData = parentData.series.find(s => s.id === currentPathItem.id);
                if (fullItemData) {
                    currentPathItem.name = fullItemData.name;
                    this._renderTimeline();
                    // Re-render timeline with correct name
                }
            }
        }
        data.heichel = heichel;
        return data;
    }

    // --- EVENT HANDLERS & ACTIONS ---

    async _handleItemClick(event) {
        const item = event.target.closest('.navigator-item[data-id]');
        if (!item || item.matches('.is-active'))
            return;

        event.preventDefault();

        // CRITICAL FIX: Get the index of the column that was clicked. This is the missing piece.
        const parentColumnEl = item.closest('.navigator-column');
        const parentColumnIndex = parseInt(parentColumnEl.dataset.columnIndex, 10);

        await this._handleSelection({
            id: item.dataset.id,
            name: item.dataset.name,
            type: item.dataset.type,
            parentColumnIndex // Pass this crucial info
        });
    }

    async _handleSelection({id, name, type, parentColumnIndex}) {
        if (type === 'heichel') {
            this.state.heichel = {
                id,
                name
            };
            this.state.path = [];
        } else if (type === 'series') {
            // CRITICAL FIX: Truncate the path based on WHICH column was clicked.
            // If we click in column 1 (parentColumnIndex=1), the new path should start after the Heichel.
            // So we slice the path up to index (1 - 1) = 0.
            const pathIndex = parentColumnIndex - 1;
            this.state.path = this.state.path.slice(0, pathIndex);
            this.state.path.push({
                id,
                name
            });
        }
        await this._updateView();
    }

        async _handleTimelineClick(event) {
        const target = event.target.closest('[data-level]');
        if (!target) return;

        const level = parseInt(target.dataset.level, 10);
        if (isNaN(level)) return;

        // --- NEW LOGIC ---
        // First, prune the visual columns based on the click
        // This makes the UI feel responsive immediately.
        // For 'Home' (level -1), we want to get back to a state with 0 columns,
        // so we prune from index 0. For others, we prune from level + 1.
        const pruneFromIndex = (level === -1) ? 0 : level + 1;
        this._pruneFutureColumns(pruneFromIndex);

        // Next, update the state
        if (level === -1) {
            // Home button: Reset the entire state
            this.state = this._getDefaultState();
        } else if (level === 0) {
            // Clicking the Heichel name: clear the path but keep the heichel
             this.state.path = [];
        } else {
            // Clicking a series in the path: truncate the path
            this.state.path = this.state.path.slice(0, level);
        }
        
        // Finally, call updateView to sync the URL and render the next column if needed.
        // Because the state is now correct and old columns are gone, this will work.
        await this._updateView();
    }

    async _handlePopState(event) {
        this.state = (event.state && 'path'in event.state) ? event.state : this._getDefaultState();
        await this._updateView(true);
    }

    async _restoreStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const heichelId = params.get('heichel');
        if (!heichelId)
            return;

        // Use a placeholder name that will be filled in when data loads
        await this._handleSelection({
            id: heichelId,
            name: '...',
            type: 'heichel',
            parentColumnIndex: 0
        });

        const pathIds = (params.get('path') || '').split('/').filter(Boolean);
        let currentIndex = 1;
        for (const pathId of pathIds) {
            await this._handleSelection({
                id: pathId,
                name: '...',
                type: 'series',
                parentColumnIndex: currentIndex++
            });
        }
    }

    // --- UTILITIES ---

    async _unwrapApiResponse(promise) {
        const response = await promise;
        if (!response) {
            throw new Error("API Error: No response received.");
        }
        if (response.error) {
            throw new Error(response.error);
        }
        // Safely handle different possible success payloads
        return {
            series: response.seriesInPath || response.series || response.success || [],
            posts: response.posts || [],
        };
    }

    _createColumnHeader(colIndex, data, isLoading) {
        const headerDiv = this._createElement('div', ['column-header']);
        if (isLoading) {
            headerDiv.classList.add('is-loading');
        }

        let name = "Loading...";
        if (!isLoading) {
            if (colIndex === 0) {
                name = "Realms";
            } else if (this.state.path[colIndex - 1]) {
                name = this.state.path[colIndex - 1].name;
            } else {
                name = "Content";
            }
        }

        const h2 = this._createElement('h2', [], [name]);
        const chronicle = this._createElement('span', ['chronicle'], [isLoading ? '...' : this._getChronicleText(data)]);
        headerDiv.append(h2, chronicle);
        return headerDiv;
    }

    _getChronicleText(data) {
        if (!data || data.error)
            return '';
        const {series=[], posts=[]} = data;
        const total = series.length + posts.length;
        return `(${total})`;
    }

    _renderItemsToList(data, colIndex) {
        const {series=[], posts=[]} = data;
        const listContainer = this._createElement('div', ['navigator-list-container']);

        const allItems = [...series, ...posts];
        if (allItems.length === 0) {
            listContainer.appendChild(this._createElement('div', ['empty-message'], ["End of the stream."]));
            return listContainer;
        }

        const nextPathId = colIndex === 0 ? this.state.heichel?.id : this.state.path[colIndex]?.id;

        allItems.forEach( (item, index) => {
            const el = 'title'in item ? this._createPostEl(item, data) : this._createItemEl(item, colIndex === 0);

            if (item.id === nextPathId) {
                el.classList.add('is-active');
            }
            el.style.setProperty('--stagger-index', index);
            listContainer.appendChild(el);
        }
        );
        return listContainer;
    }

    _updateURL() {
        if (!history.pushState)
            return;
        const url = new URL(window.location);
        url.searchParams.set('heichel', this.state.heichel?.id || '');
        const pathStr = this.state.path.map(p => p.id).join('/');
        if (pathStr) {
            url.searchParams.set('path', pathStr);
        } else {
            url.searchParams.delete('path');
        }

        history.pushState({
            ...this.state
        }, '', url.toString());
    }

    _getCacheKeyForIndex(index) {
        if (index < 0)
            return null;
        if (index === 0)
            return 'heichelos';
        const heichelId = this.state.heichel?.id;
        if (!heichelId)
            return null;
        const pathForCache = this.state.path.slice(0, index - 1);
        const pathStr = `root/${pathForCache.map(p => p.id).join('/')}`;
        return `${this.aliasDetails.id}:${heichelId}:${pathStr}`;
    }

    _createElement(tag, classes=[], children=[], attributes={}) {
        const el = document.createElement(tag);
        if (classes.length)
            el.classList.add(...classes);
        Object.entries(attributes).forEach( ([k,v]) => el.setAttribute(k, v));
        children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
        return el;
    }

    _createItemEl(d, isHeichel) {
        const name = this._createElement('span', ['item-name'], [d.name]);
        const author = this._createElement('span', ['item-author'], [d.author ? 'by ' + d.author : '']);
        const e = this._createElement('div', ['navigator-item'], [name, author], {
            role: 'button',
            tabindex: '0'
        });
        Object.assign(e.dataset, {
            id: d.id,
            name: d.name,
            type: isHeichel ? 'heichel' : 'series'
        });
        return e;
    }

    _createPostEl(d, data) {
        // Posts are links to a different page, so they use an <a> tag.
        const name = this._createElement('span', ['item-name'], [d.title]);
        const author = this._createElement('span', ['item-author'], [d.author ? `by ${d.author}` : '']);
        // NOTE: Make sure to replace '/post/path/' with your actual post URL structure
        const e = this._createElement('a', ['navigator-item', 'post-item'], [name, author], {
            href: `/heichelos/${data.heichel.id}/series/${d.parentSeriesId}/${d.index}`
        });
        // We don't add data-id, so it doesn't trigger navigation.
        return e;
    }
}

export function makeAliasPage({details, container}) {
    return new AliasPageNavigator({
        details,
        container
    });
}




