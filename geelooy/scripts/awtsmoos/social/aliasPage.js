// B"H
//================================================================================================
//
//  THE FINAL MANUSCRIPT - REFINED & FEATURE-COMPLETE
//
//  - CRITICAL BUG FIX: Corrected the navigation logic to prevent columns from disappearing on creation.
//  - NEW FEATURE: Added a secondary "action link" to series items for external navigation.
//  - REFINEMENT: Streamlined logic for a more stable and predictable user experience.
//
//================================================================================================

import {
    getHeichelosOfPostsOfAlias,
    getPostsOfAliasInSeries,
    getHeichelosOfCommentsOfAlias
} from "/scripts/awtsmoos/api/social/alias.js";


class AliasPageNavigator {

    constructor({details, container, ownership = false}) {
        this.aliasDetails = details;
        this.container = container;
        this.ownership = ownership;
        this.uniqueId = 'alias-page-hyper-instance-' + Date.now();
        this.state = this._getDefaultState();
        this.apiCache = new Map();
        this._bindMethods();
        this._initialize();
    }

    _getDefaultState() {
        return {
            heichel: null,
            path: []
        };
    }

    _bindMethods() {
        this._handleItemClick = this._handleItemClick.bind(this);
        this._handlePopState = this._handlePopState.bind(this);
        this._handleTimelineClick = this._handleTimelineClick.bind(this);
    }

    async _initialize() {
        this.container.className = `alias-page-scope ${this.uniqueId}`;
        this._setupDOM();
        this._bindEvents();
        try {
            await this._createAndRenderColumn(0);
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
        this.profileActions = this._createProfileActions();
        this.header = this._createElement('div', ['alias-header'], [homeBtn, this.timeline, this.profileActions]);
        this.activitySummary = this._createElement('section', ['alias-activity-summary'], [
            this._createActivityCard('Posts', 'Loading...', 'Realms where this alias has posted'),
            this._createActivityCard('Comments', 'Loading...', 'Heichelos where this alias has commented')
        ], { 'aria-label': 'Profile activity summary' });
        this.navigatorBody = this._createElement('div', ['navigator-body']);
        const navigator = this._createElement('div', ['alias-navigator'], [this.navigatorBody]);
        this.container.replaceChildren(this.header, this.activitySummary, navigator);
        this._renderActivitySummary();
    }

    _createProfileActions() {
        const aliasId = this.aliasDetails?.id || this.aliasDetails?.name || '';
        const actions = [];
        if (aliasId) {
            actions.push(this._createElement('a', ['alias-profile-action', 'alias-profile-message'], ['Message'], {
                href: `/email?to=${encodeURIComponent(aliasId)}`,
                'aria-label': `Open chat with ${aliasId}`
            }));
        }
        if (this.ownership && aliasId) {
            actions.push(this._createElement('a', ['alias-profile-action'], ['Mail'], {
                href: `/email?alias=${encodeURIComponent(aliasId)}`,
                'aria-label': `Open mail as ${aliasId}`
            }));
        }
        return this._createElement('nav', ['alias-profile-actions'], actions, {
            'aria-label': 'Profile actions'
        });
    }

    _bindEvents() {
        // ** MODIFIED to target the main item area, ignoring the new action link **
        this.navigatorBody.addEventListener('click', this._handleItemClick);
        this.header.addEventListener('click', this._handleTimelineClick);
        window.addEventListener('popstate', this._handlePopState);
    }

    /**
     * **NEW CENTRALIZED METHOD**
     * Makes the entire view (columns, focus, timeline) perfectly match the current state.
     * This replaces the flawed logic previously split between different handlers.
     */
        /**
     * **BUG FIX #2 & REFINED**
     * Makes the entire view (columns, focus, timeline) perfectly match the current state.
     * This corrects an off-by-one error in column and focus index calculation.
     */
    async _syncViewToState() {
        this._renderTimeline();

        // 1. Determine how many columns should exist and which should have focus.
        // **THIS IS THE CORRECTED LOGIC**
        let requiredColumnCount;
        let focusIndex;

        if (this.state.heichel) {
            // If a heichel is selected, we need a column for it, plus one for each item in the path,
            // PLUS the new column for the content of the last item.
            requiredColumnCount = this.state.path.length + 2; 
            // We want to focus on the newly created column, which is one beyond the current path length.
            focusIndex = this.state.path.length + 1;
        } else {
            // Before anything is selected, we just need the first column.
            requiredColumnCount = 1;
            focusIndex = 0;
        }

        // 2. Remove any columns that are no longer needed.
        await this._pruneFutureColumns(requiredColumnCount);

        // 3. Create any columns that are missing for the current path.
        //    (The loop now correctly goes up to, but not including, the new requiredColumnCount)
        for (let i = 0; i < requiredColumnCount; i++) {
            await this._createAndRenderColumn(i);
        }

        // 4. Set the focus to the correct column. This is the crucial final step.
        this.navigatorBody.style.setProperty('--focus-index', focusIndex);
         this._renderTimeline(); 
    }


    _renderTimeline() {
        const pathItems = [this.state.heichel, ...this.state.path].filter(Boolean);
        const timelineFragment = document.createDocumentFragment();
        if (pathItems.length > 0) {
            timelineFragment.appendChild(this._createElement('span', ['timeline-chevron'], ['›']));
        }
        pathItems.forEach((item, index) => {
            const el = this._createElement('button', ['timeline-item'], [item.name], {
                'data-level': index
            });
            if (index === pathItems.length - 1)
                el.classList.add('is-current-step');
            timelineFragment.appendChild(el);
        });
        this.timeline.replaceChildren(timelineFragment);
    }
    

    _pruneFutureColumns(activeIndex) {
        return new Promise(resolve=>{
            const columnsToRemove = Array.from(this.navigatorBody.querySelectorAll('.navigator-column')).filter(col=>parseInt(col.dataset.columnIndex, 10) >= activeIndex);
            if (columnsToRemove.length === 0)
                return resolve();
            let columnsAnimated = 0;
            const onAnimationEnd = col=>{
                col.remove();
                columnsAnimated++;
                if (columnsAnimated === columnsToRemove.length)
                    resolve()
            }
            ;
            columnsToRemove.forEach(col=>{
                col.addEventListener('animationend', ()=>onAnimationEnd(col), {
                    once: !0
                });
                col.classList.add('is-collapsing');
                setTimeout(()=>{
                    if (document.body.contains(col))
                        onAnimationEnd(col)
                }
                , 300)
            }
            )
        }
        )
    }

    async _createAndRenderColumn(columnIndex) {
        if (this.navigatorBody.querySelector(`[data-column-index="${columnIndex}"]`))
            return;
        const columnEl = this._createElement('div', ['navigator-column'], [], {
            'data-column-index': columnIndex
        });
        const columnInner = this._createElement('div', ['column-inner']);
        const placeholderHeader = this._createColumnHeader(columnIndex, null, !0);
        const skeletonLoader = this._createElement('div', ['skeleton-loader'], [this._createElement('div'), this._createElement('div'), this._createElement('div')]);
        columnInner.append(placeholderHeader, skeletonLoader);
        columnEl.appendChild(columnInner);
        this.navigatorBody.appendChild(columnEl);
        try {
            const data = await this._getDataForColumn(columnIndex);
            const realHeader = this._createColumnHeader(columnIndex, data, !1);
            const listContainer = this._renderItemsToList(data, columnIndex);
            columnInner.replaceChildren(realHeader, listContainer)
        } catch (error) {
            console.error(`FATAL: Column ${columnIndex} failed to render:`, error);
            const errorHeader = this._createColumnHeader(columnIndex, {
                error: !0
            }, !0);
            const errorMsg = this._createElement('div', ['error-message'], [error.message]);
            columnInner.replaceChildren(errorHeader, errorMsg)
        }
    }

    async _getDataForColumn(columnIndex) {
        const isHeichelos = columnIndex === 0;
        let heichel, pathForApi, pathStr;
        if (columnIndex > 0) {
            if (!this.state.heichel?.id)
                throw new Error("Heichel context is missing.");
            heichel = this.state.heichel;
            pathForApi = this.state.path.slice(0, columnIndex - 1);
            pathStr = `root/${pathForApi.map(p=>p.id).join('/')}`
        } else {
            pathStr = 'heichelos'
        }
        const cacheKey = isHeichelos ? 'heichelos' : `${this.aliasDetails.id}:${heichel.id}:${pathStr}`;
        if (this.apiCache.has(cacheKey))
            return this.apiCache.get(cacheKey);
        const fetchPromise = isHeichelos ? getHeichelosOfPostsOfAlias({
            aliasId: this.aliasDetails.id
        }) : getPostsOfAliasInSeries({
            aliasId: this.aliasDetails.id,
            heichelId: heichel.id,
            path: pathStr
        });
        const data = await this._unwrapApiResponse(fetchPromise);
        this.apiCache.set(cacheKey, data);
        if (columnIndex > 0 && this.state.path[columnIndex - 1]?.name === '...') {
            const parentData = this.apiCache.get(this._getCacheKeyForIndex(columnIndex - 1));
            const currentPathItem = this.state.path[columnIndex - 1];
            const fullItemData = parentData?.series?.find(s=>s.id === currentPathItem.id);
            if (fullItemData) {
                currentPathItem.name = fullItemData.name;
             //   this._renderTimeline()
            }
        }
        data.heichel = heichel;
        return data
    }


    /**
     * **REWRITTEN & SIMPLIFIED**
     * Handles forward navigation. Now it only updates the state and URL,
     * then delegates the entire UI update to `_syncViewToState`.
     */
    async _handleItemClick(event) {
        const item = event.target.closest('.item-main[data-id]');
        if (!item) return;
        event.preventDefault();

        const parentColumnEl = item.closest('.navigator-column');
        const parentColumnIndex = parseInt(parentColumnEl.dataset.columnIndex, 10);
        const { id, name, type } = item.dataset;

        // 1. Update state based on click type.
        if (type === 'heichel') {
            this.state.heichel = { id, name };
            this.state.path = [];
        } else if (type === 'series') {
            this.state.path = this.state.path.slice(0, parentColumnIndex);
            this.state.path.push({ id, name });
        }
        
        // 2. Update the URL to reflect the new state (for sharing, history).
        this._updateURL();

        // 3. Let the centralized function handle all DOM changes.
        await this._syncViewToState();
    }

    /**
     * **REWRITTEN & SIMPLIFIED**
     * Handles timeline/breadcrumb navigation. Updates state, then syncs view.
     */
    async _handleTimelineClick(event) {
        const target = event.target.closest('[data-level]');
        if (!target || target.classList.contains('is-current-step')) return;
        
        const level = parseInt(target.dataset.level, 10);
        if (isNaN(level)) return;

        // 1. Update state.
        if (level === -1) {
            this.state = this._getDefaultState();
        } else {
            // Keep the heichel, but truncate the path
            this.state.path = this.state.path.slice(0, level);
        }
        
        // 2. Update URL and sync view.
        this._updateURL();
        await this._syncViewToState();
    }
    
    /**
     * **REWRITTEN & SIMPLIFIED**
     * Handles browser back/forward buttons. Sets state, then syncs view.
     */
    async _handlePopState(event) {
        this.state = event.state && 'path' in event.state ? event.state : this._getDefaultState();
        // Since popstate comes from a URL that is already correct, we don't call _updateURL.
        await this._syncViewToState();
    }
    

   /**
     * **DEFINITIVE FIX USING THE BREADCRUMB ENDPOINT**
     * This function now uses the dedicated breadcrumb API to efficiently fetch all path names at once,
     * solving all initialization race conditions and "..." bugs permanently.
     */
    async _restoreStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const heichelId = params.get('heichel');
        if (!heichelId) return;

        const pathIds = (params.get('path') || '').split('/').filter(Boolean);

        try {
            // We need two pieces of info, and can get them at the same time:
            // 1. The name for the Heichel itself (from the root column data).
            // 2. The names for the entire series path (from the new breadcrumb endpoint).
            const heichelosPromise = this._getDataForColumn(0);
            
            let breadcrumbPromise;
            if (pathIds.length > 0) {
                const lastSeriesId = pathIds[pathIds.length - 1];
                breadcrumbPromise = this.getBreadcrumbForSeries({ heichelId, seriesId: lastSeriesId });
            } else {
                breadcrumbPromise = Promise.resolve([]); // No path, resolve with an empty array.
            }
            
            // Wait for both requests to finish.
            const [heichelosData, breadcrumbResult] = await Promise.all([heichelosPromise, breadcrumbPromise]);

            // Now, build the final state from the results.
            const heichelInfo = heichelosData?.series.find(h => h.id === heichelId);
            const heichelName = heichelInfo ? heichelInfo.name : '...';
            
            this.state = {
                heichel: { id: heichelId, name: heichelName },
                // The breadcrumb API gives us the path directly. Filter out any potential 'root' object if it's not meant to be shown.
                path: breadcrumbResult.filter(p => p.id.toLowerCase() !== 'root')
            };

        } catch (error) {
            console.error("Critical error during page load state restoration:", error);
            // Fallback to the "..." display if the APIs fail catastrophically.
            this.state.heichel = { id: heichelId, name: '...' };
            this.state.path = pathIds.map(id => ({ id, name: '...' }));
        }

        // FINALLY, with a fully correct state, render the UI.
        await this._syncViewToState();
    }


    /**
     * Fetches the full breadcrumb path for a given series.
     * @param {object} params
     * @param {string} params.heichelId
     * @param {string} params.seriesId The ID of the LAST series in the path.
     * @returns {Promise<Array<{id: string, name: string}>>}
     */
    async getBreadcrumbForSeries({ heichelId, seriesId }) {
        if (!heichelId || !seriesId) {
            throw new Error("Heichel ID and Series ID are required for breadcrumb.");
        }
        try {
            const response = await fetch(`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/breadcrumb`);
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data; 
        } catch (error) {
            console.error("Failed to fetch breadcrumb:", error);
            return []; // Return empty array on failure
        }
    }

    _updateURL() {
        if (!history.pushState)
            return;
        const url = new URL(window.location);
        url.search = '';
        if (this.state.heichel?.id) {
            url.searchParams.set('heichel', this.state.heichel.id);
            const pathStr = this.state.path.map(p=>p.id).join('/');
            if (pathStr)
                url.searchParams.set('path', pathStr)
        }
        // Check if the new URL is different from the current one before pushing
        if (url.toString() !== window.location.toString()) {
            history.pushState({ ...this.state }, '', url.toString());
        }
    }

    _createItemEl(d, isHeichel) {
        const itemName = this._createElement('span', ['item-name'], [d.name]);
        const itemAuthor = this._createElement('span', ['item-author'], [d.author ? 'by ' + d.author : '']);
        const itemMain = this._createElement('div', ['item-main'], [itemName, itemAuthor], {
            role: 'button',
            tabindex: '0'
        });
        Object.assign(itemMain.dataset, {
            id: d.id,
            name: d.name,
            type: isHeichel ? 'heichel' : 'series'
        });
        const container = this._createElement('div', ['navigator-item'], [itemMain]);
        if (!isHeichel) {
            const actionIcon = this._createElement('span', ['action-icon']);
            const actionLink = this._createElement('a', ['item-action'], [actionIcon], {
                href: `/heichelos/${encodeURIComponent(this.state.heichel?.id || "")}?view=series&series=${encodeURIComponent(d.id)}`,
                'aria-label': `View details for ${d.name}`,
                title: `View details for ${d.name}`
            });
            container.appendChild(actionLink);
        }
        return container;
    }

    _createElement(tag, classes=[], children=[], attributes={}) {
        const el = document.createElement(tag);
        if (classes.length)
            el.classList.add(...classes);
        Object.entries(attributes).forEach(([k,v])=>el.setAttribute(k, v));
        children.forEach(c=>el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
        return el
    }
    
    async _unwrapApiResponse(promise) {
        const response = await promise;
        if (!response)
            throw new Error("API Error: No response received.");
        if (response.error)
            throw new Error(response.error?.message || response.error?.code || response.error || 'API Error');
        return {
            series: response.seriesInPath || response.series || response.success || [],
            posts: response.posts || []
        }
    }
    _createColumnHeader(colIndex, data, isLoading) {
        const headerDiv = this._createElement('div', ['column-header']);
        if (isLoading)
            headerDiv.classList.add('is-loading');
        let name = "Loading...";
        if (!isLoading) {
            if (colIndex === 0)
                name = "Realms";
            else if (this.state.path[colIndex - 1])
                name = this.state.path[colIndex - 1].name;
            else
                name = "Content"
        }
        const h2 = this._createElement('h2', [], [name]);
        const chronicle = this._createElement('span', ['chronicle'], [isLoading ? '...' : this._getChronicleText(data)]);
        headerDiv.append(h2, chronicle);
        return headerDiv
    }
    _getChronicleText(data) {
        if (!data || data.error)
            return '';
        const {series=[], posts=[]} = data;
        const total = series.length + posts.length;
        return `(${total})`
    }
    _renderItemsToList(data, colIndex) {
        const {series=[], posts=[]} = data;
        const listContainer = this._createElement('div', ['navigator-list-container']);
        const allItems = [...series, ...posts];
        if (allItems.length === 0) {
            listContainer.appendChild(this._createElement('div', ['empty-message'], ["End of the stream."]));
            return listContainer
        }
        allItems.forEach(item=>{
            const el = 'title'in item ? this._createPostEl(item, data) : this._createItemEl(item, colIndex === 0);
            listContainer.appendChild(el)
        }
        );
        return listContainer
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
        const pathStr = `root/${pathForCache.map(p=>p.id).join('/')}`;
        return `${this.aliasDetails.id}:${heichelId}:${pathStr}`
    }
    _createPostEl(d, data) {
        const name = this._createElement('span', ['item-name'], [d.title]);
        const author = this._createElement('span', ['item-author'], [d.author ? `by ${d.author}` : '']);
        const e = this._createElement('a', ['navigator-item', 'post-item'], [name, author], {
            href: `/heichelos/${encodeURIComponent(data.heichel.id)}/series/${encodeURIComponent(d.parentSeriesId)}/${encodeURIComponent(d.index)}`
        });
        return e
    }
}

export function makeAliasPage({details, container, ownership = false}) {
    return new AliasPageNavigator({
        details,
        container,
        ownership
    });
}