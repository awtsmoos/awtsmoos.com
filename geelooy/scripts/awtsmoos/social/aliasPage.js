//B"H
import {
    /*
        returns {
            successs: [
                {author, name, id}
                ..
            ]
        } or {error}
    */
    getHeichelosOfPostsOfAlias,


   /*
        returns {
            successs: [
                {
                    author, 
                    name, id,
                    createdAt,
                    parentSeriesid
                }
                ..
            ]
        } or {error}
    */
    getSeriesOfPostsOfAliasInHeichel,
    
    /*
        returns {
            successs: [
                {
                    author, 
                    title, id,
                    createdAt,
                    parentSeriesid,
                    index
                }
                ..
            ]
        } or {error}
    */
    getPostsOfAliasInSeries
} from 
    "/scripts/awtsmoos/api/social/alias.js"
console.log('B"H\n')

window.getHeichelosOfPostsOfAlias = 
    getHeichelosOfPostsOfAlias;

 window.getSeriesOfPostsOfAliasInHeichel = 
    getSeriesOfPostsOfAliasInHeichel;

window.getPostsOfAliasInSeries = 
    getPostsOfAliasInSeries;

// B"H

// Helper for creating styled DOM elements
function createElement(tag, classNames = [], children = [], attributes = {}) {
    const el = document.createElement(tag);
    el.classList.add(...classNames);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else {
            el.appendChild(child);
        }
    }
    return el;
}

// The main function to construct the Alias Page Experience
export async function makeAliasPage({
    /*
        {id, name, description}
    */
    details,
    ownership,

    /*
        htmlNode
    */
    container
}) {
  

    
    // --- State Management ---
    let state = {
        currentHeichelId: null,
        currentSeriesId: null
    };

    // --- DOM Structure ---
    container.innerHTML = '';
    const aliasPageContainer = createElement('div', ['alias-page-container']);
    const navigator = createElement('div', ['alias-navigator']);
    
    const header = createElement('div', ['alias-header'], [
        createElement('h1', ['alias-name'], [details.name]),
        createElement('p', ['alias-description'], [details.description])
    ]);

    const body = createElement('div', ['navigator-body']);
    const heichelColumn = createElement('div', ['navigator-column', 'heichel-column']);
    const seriesColumn = createElement('div', ['navigator-column', 'series-column']);
    const postsColumn = createElement('div', ['navigator-column', 'posts-column']);

    body.append(heichelColumn, seriesColumn, postsColumn);
    navigator.append(header, body);
    aliasPageContainer.append(navigator);
    container.append(aliasPageContainer);

    // --- URL and History Management ---
    function updateURL() {
        const url = new URL(window.location);
        if (state.currentHeichelId) {
            url.searchParams.set('heichel', state.currentHeichelId);
        } else {
            url.searchParams.delete('heichel');
        }
        if (state.currentSeriesId) {
            url.searchParams.set('series', state.currentSeriesId);
        } else {
            url.searchParams.delete('series');
        }
        history.pushState(state, '', url.toString());
    }
    
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            restoreState(event.state.currentHeichelId, event.state.currentSeriesId);
        } else {
            restoreState(null, null);
        }
    });

    // --- Data Loading Functions ---

    function displayLoading(columnEl) {
        columnEl.innerHTML = '';
        const loader = createElement('div', ['loader']);
        columnEl.append(loader);
    }
    
    function displayError(columnEl, message) {
        columnEl.innerHTML = '';
        const error = createElement('div', ['error-message'], [message]);
        columnEl.append(error);
    }
    
    async function loadHeichelos() {
        displayLoading(heichelColumn);
        seriesColumn.innerHTML = '';
        postsColumn.innerHTML = '';

        try {
            // UPDATED API CALL
            const result = await getHeichelosOfPostsOfAlias({
                aliasId: details.id
            });
            if (result.error) throw new Error(result.error);
            
            heichelColumn.innerHTML = '';
            const list = createElement('ul', ['navigator-list']);
            result.success.forEach(heichel => {
                const item = createElement('li', ['navigator-item'], [
                     createElement('span', ['item-name'], [heichel.name]),
                     createElement('span', ['item-author'], [`by ${heichel.author}`]),
                     createElement('a', ['external-link-icon'], ["→"], { href: `/heichelos/${heichel.id}`, title: "Go to Heichel Page" })
                ]);
                
                item.dataset.id = heichel.id;
                
                item.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') return;
                    if (state.currentHeichelId === heichel.id) return;

                    state.currentHeichelId = heichel.id;
                    state.currentSeriesId = null;
                    
                    document.querySelectorAll('.heichel-column .navigator-item.active').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    updateURL();
                    loadSeries(heichel.id);
                });
                list.append(item);
            });
            heichelColumn.append(list);
        } catch (err) {
            displayError(heichelColumn, `Failed to load heichelos: ${err.message}`);
        }
    }

    async function loadSeries(heichelId) {
        displayLoading(seriesColumn);
        postsColumn.innerHTML = '';
        
        try {
            // UPDATED API CALL
            const result = await getSeriesOfPostsOfAliasInHeichel({
                aliasId: details.id, 
                heichelId
            });
            if (result.error) throw new Error(result.error);
            
            seriesColumn.innerHTML = '';
            const list = createElement('ul', ['navigator-list']);
            result.success.forEach(series => {
                const item = createElement('li', ['navigator-item'], [
                    createElement('span', ['item-name'], [series.name]),
                    createElement('span', ['item-author'], [`by ${series.author}`]),
                    createElement('a', ['external-link-icon'], ["→"], { href: `/heichelos/${heichelId}?view=series&series=${series.id}`, title: "Go to Series Page" })
                ]);

                item.dataset.id = series.id;
                
                item.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') return;
                    if (state.currentSeriesId === series.id) return;

                    state.currentSeriesId = series.id;

                    document.querySelectorAll('.series-column .navigator-item.active').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    updateURL();
                    // CORRECTED: Pass heichelId down to the next function
                    loadPosts(series.id, heichelId);
                });
                list.append(item);
            });
            seriesColumn.append(list);
        } catch(err) {
             displayError(seriesColumn, `Failed to load series: ${err.message}`);
        }
    }

    async function loadPosts(seriesId, heichelId) {
        displayLoading(postsColumn);
        
        try {
            // UPDATED API CALL
            const result = await getPostsOfAliasInSeries({
                aliasId: details.id, 
                heichelId,
                seriesId
            });
            if (result.error) throw new Error(result.error);
            
            postsColumn.innerHTML = '';
            const list = createElement('ul', ['navigator-list', 'posts-list']);
            result.success.forEach(post => {
                const href = `/heichelos/${heichelId}/series/${seriesId}/${post.index}`;
                const item = createElement('li');
                const link = createElement('a', ['navigator-item', 'post-item'], [
                     createElement('span', ['item-name'], [post.title]),
                     createElement('span', ['item-author'], [`by ${post.author}`])
                ], { href });
                
                item.append(link);
                list.append(item);
            });
            postsColumn.append(list);
        } catch(err) {
            displayError(postsColumn, `Failed to load posts: ${err.message}`);
        }
    }
    
    async function restoreState(heichelId, seriesId) {
        state.currentHeichelId = heichelId;
        state.currentSeriesId = seriesId;
        
        await loadHeichelos();
        
        if (heichelId) {
            const heichelItem = heichelColumn.querySelector(`.navigator-item[data-id="${heichelId}"]`);
            if (heichelItem) {
                heichelItem.classList.add('active');
                await loadSeries(heichelId);
            }
        }
        
        // This must run after loadSeries has potentially populated the series column
        if (heichelId && seriesId) {
             const seriesItem = seriesColumn.querySelector(`.navigator-item[data-id="${seriesId}"]`);
             if (seriesItem) {
                 seriesItem.classList.add('active');
                 // CORRECTED: Pass both IDs to load the final column
                 await loadPosts(seriesId, heichelId);
             }
        }
    }

    // --- Initial Load ---
    const initialParams = new URLSearchParams(window.location.search);
    restoreState(initialParams.get('heichel'), initialParams.get('series'));
}
