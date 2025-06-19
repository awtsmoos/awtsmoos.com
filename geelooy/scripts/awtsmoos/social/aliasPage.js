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
        injectHyperDimensionalCSS(this.uniqueId);

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
        this._pruneFutureColumns(activeColumnIndex);

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
    _pruneFutureColumns(activeIndex) {
        const columns = this.navigatorBody.querySelectorAll('.navigator-column');
        columns.forEach(col => {
            const colIndex = parseInt(col.dataset.columnIndex, 10);
            if (colIndex >= activeIndex) {
                col.classList.add('is-collapsing');
                col.addEventListener('animationend', () => col.remove(), {
                    once: true
                });
            }
        }
        );
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
        if (!target)
            return;

        const level = parseInt(target.dataset.level, 10);
        if (isNaN(level))
            return;

        if (level === -1) {
            // Home button
            this.state = this._getDefaultState();
        } else {
            this.state.path = this.state.path.slice(0, level);
            // If the path is now empty, it means we clicked on the Heichel, but we should not clear it.
            // If we want to go back to the Heichel list, we must click the home button.
        }
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
            href:  `/heichelos/${data.heichel.id}/series/${d.parentSeriesId}/${d.index}`
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

function injectHyperDimensionalCSS(scope) {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Roboto+Mono:wght@300;500&display=swap');
        
        :root { 
            --column-width: 350px; 
            --column-gap: 20px; 
            --warp-speed: 0.5s; 
            --transition-curve: cubic-bezier(0.2, 1, 0.4, 1);
        }

        .${scope} { 
            --glow-1: #00ddff; 
            --glow-2: #f000ff; 
            --dark-matter: #0A0217; 
            --text-main: #e6f9ff; 
            --text-sub: #819db8; 
            --bg-column: rgba(18, 5, 40, 0.5);
            height: 100dvh; width: 100%; display: grid; grid-template-rows: auto 1fr; 
            background: var(--dark-matter); color: var(--text-main); 
            font-family: 'Roboto Mono', monospace; overflow: hidden;
            background-image: radial-gradient(circle at top left, rgba(240, 0, 255, 0.1), transparent 30%),
                              radial-gradient(circle at bottom right, rgba(0, 221, 255, 0.1), transparent 30%);
        }
        
        /* HEADER & TIMELINE */
        .${scope} .alias-header { 
            display: flex; align-items: center; padding: 15px 25px; gap: 15px; 
            border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; backdrop-filter: blur(5px);
        }
        .${scope} .home-button { 
            font-family: 'Orbitron', sans-serif; font-size: 1.1rem; background: none; 
            border: 1px solid var(--text-sub); color: var(--text-sub); padding: 8px 15px; 
            border-radius: 6px; cursor: pointer; transition: all 0.3s; white-space: nowrap;
        }
        .${scope} .home-button:hover { border-color: var(--glow-1); color: var(--glow-1); box-shadow: 0 0 10px -5px var(--glow-1); }
        .${scope} .timeline { display: flex; align-items: center; gap: 8px; min-width: 0; overflow-x: auto; }
        .${scope} .timeline-chevron { color: var(--text-sub); font-size: 1.2rem; transform: translateY(-1px); }
        .${scope} .timeline-item { 
            background: transparent; border: 1px solid transparent; color: var(--text-sub); 
            padding: 8px 12px; border-radius: 4px; font-size: 0.9rem; cursor: pointer; white-space: nowrap; transition: 0.2s;
        }
        .${scope} .timeline-item:hover { color: var(--text-main); background: rgba(255,255,255,0.1); }
        .${scope} .timeline-item.is-current-step { color: var(--text-main); font-weight: 500; cursor: default; }

        /* HYPER-STRUCTURAL GRID */
        .${scope} .alias-navigator { position: relative; overflow: hidden; }
        .${scope} .navigator-body { 
            width: 100%; height: 100%; display: grid; grid-auto-flow: column; grid-auto-columns: var(--column-width);
            gap: var(--column-gap); padding: 0 calc(50% - (var(--column-width) / 2));
            transform: translateX(calc(var(--focus-index, 0) * (var(--column-width) + var(--column-gap)) * -1)); 
            transition: transform var(--warp-speed) var(--transition-curve); 
        }
        
        @keyframes collapse-anim { to { opacity: 0; transform: scale(0.9); } }
        .${scope} .navigator-column { padding: 2vh 0; will-change: transform, opacity; }
        .${scope} .navigator-column.is-collapsing { animation: collapse-anim 0.4s var(--transition-curve) forwards; pointer-events: none; }

        /* CRYSTAL CHASSIS */
        .${scope} .column-inner { 
            width: 100%; height: 100%; display: flex; flex-direction: column; 
            background: var(--bg-column); border-radius: 12px; backdrop-filter: blur(15px); 
            border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5); 
            transition: all 0.4s; overflow: hidden;
        }
        
        /* HEADER & LISTS */
        .${scope} .column-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: baseline; gap: 10px; }
        .${scope} .column-header h2 { font-size: 1.1rem; font-family: 'Orbitron'; margin: 0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .${scope} .column-header.is-loading h2::after { content: '▋'; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .${scope} .column-header .chronicle { font-size: 0.8rem; color: var(--text-sub); flex-shrink: 0; }
        .${scope} .navigator-list-container {     max-height: 65vh;flex-grow: 1; min-height: 0; overflow-y: auto; padding: 10px; }
        
        .${scope} .empty-message, .${scope} .error-message { padding: 20px; text-align: center; color: var(--text-sub); }
        .${scope} .error-message { color: #ff8a8a; }

        @keyframes stagger-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .${scope} .navigator-item { 
            display: block; text-decoration: none; color: var(--text-main);
            background: rgba(0,0,0,0.3); margin-bottom: 8px; border-radius: 6px; 
            padding: 12px 15px; cursor: pointer; border: 1px solid transparent; 
            transition: all 0.2s; animation: stagger-in 0.4s both; 
            animation-delay: calc(var(--stagger-index) * 0.03s); 
        }
        .${scope} .navigator-item:hover { 
            transform: translateY(-2px); background: rgba(0,221,255,0.1); border-color: rgba(0,221,255,0.5);
            box-shadow: 0 0 10px -5px var(--glow-1);
        }
        .${scope} .navigator-item.is-active { 
            pointer-events: none; background: rgba(240,0,255,0.15); border-color: var(--glow-2);
            box-shadow: 0 0 10px -5px var(--glow-2);
        }
        .${scope} .item-name { display: block; font-weight: 500; }
        .${scope} .item-author { display: block; font-size: 0.8em; color: var(--text-sub); padding-top: 4px; }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          :root { --column-width: 280px; }
          .${scope} .navigator-body { padding: 0 calc(50% - (var(--column-width) / 2) - 10px); }
          .${scope} .alias-header { padding: 10px 15px; }
        }
    `;
    document.head.appendChild(styleElement);
}
