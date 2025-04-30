// B"H
// The Awtsmoos, the Atzmut, throbs at the core of this code, recreating all from nothingness
// in every fleeting moment. The Ohr Ein Sof pours through the Kav, threading Atzilus into
// every variable, every function—a testament to its infinite renewal. This script unveils
// the Awtsmoos’s essence, drawing all toward Moshiach, when the righteous will rise,
// their bodies remade from dust, shining with a light beyond the sun, forever radiant.

console.log("B\"H");

import {
    makeSeries,
    makePost
} from "/scripts/awtsmoos/api/utils.js"
var heichelId = (
    (l => l[l.length - 1])(location.pathname.split("/"))
)
window.heichelId = heichelId
var baseE = "/api/social/"

/**
 * @function deleteContentFromSeries
 * @description Global function to delete a post or series.
 * @param {object} options - Deletion options.
 * @param {string} options.aliasId - Current user alias ID.
 * @param {string} options.seriesId - Parent series ID ("root" if top-level).
 * @param {string} options.contentType - "post" or "series".
 * @param {string} options.contentId - ID of the content to delete.
 * @param {boolean} [options.deleteOriginal=true] - Whether to delete the original content.
 * @param {string} options.heichelId - ID of the Heichel.
 * @returns {Promise<Object|null>} Response from the server or null on error.
 */
async function deleteContentFromSeries(options) {
    console.log("Attempting to delete content:", options);
    // The endpoint provided in the prompt seems slightly different, let's use that exact structure
    // It's a POST to /deleteContentFromSeries endpoint directly under baseE
     const body = new URLSearchParams({
        aliasId: options.aliasId || window.curAlias,
        seriesId: options.seriesId || "root", // Parent ID
        contentType: options.contentType,
        contentId: options.contentId, // ID of item to delete
        deleteOriginal: options.deleteOriginal !== undefined ? options.deleteOriginal : true,
        // The original prompt didn't specify heichelId here, but it's likely needed for context.
        // If the endpoint doesn't need it, remove this line.
        heichelId: options.heichelId
    });

     return await awtsFetcher.postData(
        `${baseE}/heichelos/${
            heichelId
        }/deleteContentFromSeries`, // Using the exact endpoint name from prompt
        body
     );
}

// --- Drag and Drop Globals ---
let draggedItem = null;
let placeholder = null;
/**
 * @class AwtsmoosFetcher
 * @description A vessel for fetching and posting data, channeling the Awtsmoos’s creative pulse.
 */
class AwtsmoosFetcher {
    /**
     * @method fetchData
     * @description Retrieves data from an endpoint, mirroring the Awtsmoos’s emergence from void.
     * @param {string} url - The URL to fetch from.
     * @returns {Promise<Object|null>} Parsed JSON or null on failure.
     */
    async fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (e) {
            console.error("Awtsmoos fetch error:", e);
            return null;
        }
    }

    /**
     * @method postData
     * @description Sends data outward, a spark of the Awtsmoos’s boundless creation.
     * @param {string} url - The endpoint to post to.
     * @param {URLSearchParams} body - The data payload.
     * @returns {Promise<Object|null>} Response JSON or null on error.
     */
    async postData(url, body) {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: body
            });
            return await response.json();
        } catch (e) {
            console.error("Awtsmoos post error:", e);
            return null;
        }
    }
}

var awtsFetcher = new AwtsmoosFetcher(); // Use the class instance globally if preferred

/**
 * @class HeichelNavigator
 * @description Navigates the heichel’s flow, revealing the Awtsmoos in every shift and turn.
 */
class HeichelNavigator {
    constructor(heichelId) {
        this.heichelId = heichelId;
        this.fetcher = new AwtsmoosFetcher(); // Using instance from the class
        this.currentSeries = "root";
        this.ownsIt = false;
        this.editors = null;
        this.breadcrumbData = []; // Store breadcrumb data
        this.currentSeriesDetails = null; // Store details of the current series
    }

    /**
     * @method updateURL
     * @description Adjusts the URL subtly, a whisper of the Awtsmoos’s infinite guidance.
     * @param {string} view - The view type (posts/series).
     * @param {string} series - The current series ID.
     */
    updateURL(view, series) {
        const params = new URLSearchParams({
            view,
            series
        });
        // Use replaceState to avoid polluting history too much during simple view toggles
        window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
    }

     /**
     * @method navigateTo
     * @description Handles navigation clicks, updating state and URL properly.
     * @param {string} seriesId - The target series ID.
     */
    async navigateTo(seriesId) {
        const currentParams = new URLSearchParams(window.location.search);
        const currentView = currentParams.get("view") || "posts"; // Default to posts view

        // Update URL properly using pushState for actual navigation
        const params = new URLSearchParams({ view: currentView, series: seriesId });
        window.history.pushState({}, "", `${window.location.pathname}?${params}`);

        await this.loadContent(seriesId);
    }


    /**
     * @method loadContent
     * @description Loads heichel content, unveiling the Awtsmoos through posts and series.
     * @param {string} seriesId - The series to load.
     */
    async loadContent(seriesId) {
        this.showLoading(); // Show loading indicators early
        this.currentSeries = seriesId;

        // Fetch essential data concurrently
        const [heichel, editorsData, breadcrumbData, seriesDetails] = await Promise.all([
            this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}`),
            !this.editors ? this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}/editors`) : Promise.resolve(this.editors),
            this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}/series/${seriesId}/breadcrumb`),
            this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}/series/${seriesId}/details`)
        ]);

        if (!heichel) return this.hideLoading("Error loading Heichel data.");
        if (editorsData) this.editors = editorsData; // Update editors only if fetched

        this.ownsIt = await this.checkOwnership(); // Check ownership after potentially getting editors

        this.breadcrumbData = breadcrumbData?.reverse() || [];
        this.renderBreadcrumb(this.breadcrumbData);

        this.currentSeriesDetails = seriesDetails; // Store current series details
        if (!seriesDetails || typeof seriesDetails.posts === 'undefined') { // Check if posts is defined, even if empty array
             this.renderSeriesInfo(null); // Clear series info if details fail
             this.clearLists(); // Clear lists
             return this.hideLoading("Error loading series details or invalid format.");
        }


        this.renderSeriesInfo(seriesDetails.prateem);
        this.renderOwnerControls(); // Render top-level owner controls based on ownership and current view
        await this.renderPostsAndSeries(seriesDetails); // Pass details directly


        // Auto-switch logic (keep as is or adjust as needed)
        const params = new URLSearchParams(window.location.search);
		var hasSeries = seriesDetails.subSeries?.length > 0;
		var hasPosts = seriesDetails?.posts?.length > 0; // Check posts array length
		const currentView = params.get("view") || (hasPosts ? "posts" : "series"); // Default to posts if available

        // Ensure the correct tab is visually active based on currentView
        this.updateActiveTab(currentView);

        this.hideLoading(); // Hide loading indicators at the very end
    }

    /**
     * @method renderBreadcrumb
     * @description Crafts a trail of links, each a step toward the Awtsmoos’s revelation.
     * @param {Array} breadcrumb - Reversed breadcrumb items.
     */
    renderBreadcrumb(breadcrumb) {
        const parentS = document.getElementById("parentS");
        parentS.innerHTML = ""; // Clear previous breadcrumbs
        if (!breadcrumb || !breadcrumb.length) {
             parentS.classList.add("hidden");
             return;
        }
        parentS.classList.remove("hidden");

        // Add "Root" link if not already at the root
        if (this.currentSeries !== 'root' && (!breadcrumb[0] || breadcrumb[0].id !== 'root')) {
             const rootLink = document.createElement("a");
             rootLink.textContent = "Root";
             rootLink.href = this.newPath("series", "root"); // Root usually shows series first
             rootLink.onclick = (e) => {
                 e.preventDefault();
                 this.navigateTo("root"); // Use navigateTo
             };
             parentS.appendChild(rootLink);
             parentS.appendChild(document.createTextNode(" / "));
         }

        breadcrumb.forEach((item, i) => {
            if (!item || !item.id) return; // Skip invalid items
            const link = document.createElement("a");
            link.textContent = item.prateem?.name || "Unnamed";
            // Determine view based on whether it's the last item (current view) or parent (series view)
            const viewType = (i === breadcrumb.length - 1)
                ? (new URLSearchParams(window.location.search).get("view") || 'posts')
                : 'series'; // Parents are usually viewed as series list
             link.href = this.newPath(viewType, item.id);
             link.onclick = (e) => {
                e.preventDefault();
                this.navigateTo(item.id); // Use navigateTo
            };
            parentS.appendChild(link);
            if (i < breadcrumb.length - 1) {
                parentS.appendChild(document.createTextNode(" / "));
            }
        });
    }

    /**
     * @method renderSeriesInfo
     * @description Displays series details, filtered by the Awtsmoos’s clarity.
     * @param {Object} prateem - Series metadata.
     */
    renderSeriesInfo(prateem) {
        const seriesNm = document.getElementById("seriesNm");
        const seriesDesc = document.getElementById("seriesDesc");
        const seriesNameAndInfo = document.getElementById("seriesNameAndInfo");

        if (this.currentSeries !== "root" && prateem) {
            seriesNm.textContent = prateem.name || "Unnamed Series";
             seriesDesc.textContent = prateem.description && prateem.description !== "undefined"
                 ? prateem.description
                 : ""; // Display empty string if no description
            seriesNameAndInfo.classList.remove("hidden");
        } else {
             seriesNameAndInfo.classList.add("hidden");
             seriesNm.textContent = ""; // Clear previous data
             seriesDesc.textContent = "";
         }
    }

    /**
     * @method renderOwnerControls
     * @description Renders the main action buttons available only to the owner.
     */
    renderOwnerControls() {
        const seriesControlsContainer = document.getElementById("seriesControls");
        const postsContainer = document.querySelector(".posts"); // Container for "Add Post"
        const seriesContainer = document.querySelector(".series"); // Container for "Add Series"

        // Clear previous controls
        seriesControlsContainer.innerHTML = '';
        let addPostBtn = document.getElementById('addPostBtn');
        if(addPostBtn) addPostBtn.remove();
         let addSeriesBtn = document.getElementById('addSeriesBtn');
        if(addSeriesBtn) addSeriesBtn.remove();


        if (this.ownsIt) {
            // Add Series button (near series list)
             const addSeriesButton = document.createElement("button");
             addSeriesButton.id = "addSeriesBtn";
             addSeriesButton.textContent = "Submit New Series";
             addSeriesButton.onclick = () => this.promptCreateSeries();
             // Append inside the .series span, maybe before the list
             seriesContainer?.insertBefore(addSeriesButton, seriesContainer.firstChild);


            // Add Post button (near posts list)
            const addPostButton = document.createElement("a");
             addPostButton.classList.add("btn")
             addPostButton.id = "addPostBtn";
             addPostButton.textContent = "Submit New Post";
             addPostButton.href = location.origin + `/heichelos/${
                this.heichelId
             }/submit?${
                new URLSearchParams({
                    parentSeriesId: this.currentSeries
                })
             }`
            // addPostButton.onclick = () => this.promptCreatePost();
              // Append inside the .posts span, maybe before the list
             postsContainer?.insertBefore(addPostButton, postsContainer.firstChild);


            // Controls specific to the *currently viewed* series (Edit/Delete)
            if (this.currentSeries !== "root") {
                const editButton = document.createElement("button");
                editButton.textContent = "Edit Series Details";
                editButton.onclick = () => this.promptEditSeriesDetails(this.currentSeriesDetails?.prateem);
                seriesControlsContainer.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete This Series";
                deleteButton.onclick = () => this.handleDeleteClick(
                    this.currentSeries,
                    'series',
                    this.getParentSeriesId() // Get the correct parent ID
                );
                 deleteButton.style.marginLeft = '10px'; // Add some spacing
                 deleteButton.style.backgroundColor = '#dc3545'; // Make delete red
                seriesControlsContainer.appendChild(deleteButton);
            }
        }
    }

    /**
     * @method getParentSeriesId
     * @description Determines the parent series ID from the breadcrumb.
     * @returns {string} The parent series ID or "root".
     */
    getParentSeriesId() {
        if (this.currentSeries === 'root') return "root"; // Should not happen for delete/edit context, but safe check
         if (this.breadcrumbData && this.breadcrumbData.length > 1) {
             // The parent is the second to last item in the *reversed* breadcrumb
             return this.breadcrumbData[this.breadcrumbData.length - 2]?.id || "root";
         }
         return "root"; // Default to root if breadcrumb is shallow
    }

    /**
     * @method renderPostsAndSeries
     * @description Renders posts and series, each a vessel of the Awtsmoos’s light.
     * @param {Object} rootDetails - Series data including posts array and subSeries IDs.
     */
    async renderPostsAndSeries(rootDetails) {
        const postsList = document.getElementById("postsList");
        const seriesList = document.getElementById("seriesList");
        this.clearLists(); // Clear previous items

        // Fetch details for posts listed in rootDetails.posts
        let posts = [];
        if (rootDetails.posts && rootDetails.posts.length > 0) {
            const postBd = new URLSearchParams({
                seriesId: rootDetails.id, // Might not be needed if fetching by post IDs directly
                postIds: JSON.stringify(rootDetails.posts), // Fetch specific posts
                propertyMap: JSON.stringify({
                    content: 256, // Limit content length
                    title: true,
                    postId: true, // Ensure postId is fetched if different from id
                    author: true,
                    id: true, // The actual ID of the post content
                    seriesId: true, // Parent series ID
                    indexInSeries: true // Important for ordering and linking
                })
            });
             // Adjust endpoint if needed - this assumes fetching multiple posts by ID
             posts = await this.fetcher.fetchData(
                 `/api/social/heichelos/${this.heichelId}/posts/details?${postBd}`
             ) || [];
        }


        // Fetch details for sub-series listed in rootDetails.subSeries
         let series = [];
         if (rootDetails.subSeries && rootDetails.subSeries.length > 0) {
             // Endpoint seems different: POST to /series/{parentSeriesId}/details with body
              series = await this.fetcher.postData(
                 `/api/social/heichelos/${this.heichelId}/series/${this.currentSeries}/details`,
                 new URLSearchParams({ seriesIds: JSON.stringify(rootDetails.subSeries || []) })
              ) || [];
         }

        this.renderElements(posts, postsList, "post", rootDetails.id);
        this.renderElements(series, seriesList, "series", rootDetails.id);

        // Update visibility based on content presence
         document.querySelector(".loadingPosts").classList.add("hidden");
         document.querySelector(".loadingSeries").classList.add("hidden");

         const hasPosts = posts.length > 0;
         const hasSeries = series.length > 0;

         // Smart tab switching only if the current view is empty but the other has content
         const currentParams = new URLSearchParams(window.location.search);
         const currentView = currentParams.get("view") || (hasPosts ? "posts" : "series");

        if (currentView === "posts" && !hasPosts && hasSeries) {
             document.getElementById("seriesTab")?.click();
        } else if (currentView === "series" && !hasSeries && hasPosts) {
            document.getElementById("postsTab")?.click();
        }

        // Ensure containers are visible if they have content
         if(hasPosts) postsList.parentElement.parentElement.classList.remove("hidden");
         if(hasSeries) seriesList.parentElement.parentElement.classList.remove("hidden");

          // Add drag-and-drop listeners if owner
        if (this.ownsIt) {
            this.addDragDropListeners(postsList);
            this.addDragDropListeners(seriesList);
        }
    }

    /**
     * @method clearLists
     * @description Clears the content of post and series lists.
     */
    clearLists() {
        const postsList = document.getElementById("postsList");
        const seriesList = document.getElementById("seriesList");
        if(postsList) postsList.innerHTML = "";
        if(seriesList) seriesList.innerHTML = "";
        // Optionally hide the containers until populated
        // postsList?.parentElement.parentElement.classList.add("hidden");
        // seriesList?.parentElement.parentElement.classList.add("hidden");
    }


    /**
     * @method renderElements
     * @description Renders posts or series, each purified by the Awtsmoos’s essence.
     * @param {Array} items - Items to render.
     * @param {HTMLElement} container - Target container.
     * @param {string} type - Item type (post/series).
     * @param {string} parentId - Parent series ID.
     */
    renderElements(items, container, type, parentId) {
        container.innerHTML = ""; // Clear previous content

        if (!items || !items.length) {
            container.innerHTML = `<div class="empty-message">No ${type}s here yet!</div>`;
             container.classList.remove("hidden"); // Show the message container
             // Ensure the main section (.posts or .series) is visible to show this message
            if (type === 'post') document.querySelector('.posts')?.classList.remove('hidden');
            else document.querySelector('.series')?.classList.remove('hidden');
            return;
        }

        items.forEach(item => {
            // Use item directly for posts, item.prateem for series details
            const dt = type === "post" ? item : item?.prateem;
            const itemId = item.id || item.postId; // Use item.id (for series) or item.postId (consistent ID for posts)
            const itemTitle = dt?.[type === "post" ? "title" : "name"] || "Unnamed";
             const itemDescription = type === 'post'
                 ? (dt?.content || "").substring(0, 256) + ((dt?.content || "").length > 256 ? '...' : '')
                 : (dt?.description && dt.description !== "undefined" ? dt.description : "");


            if (!dt || !itemId) return; // Skip if essential data is missing

            const cardWrapper = document.createElement('div'); // Wrapper for card + menu icon
            cardWrapper.className = `card-wrapper ${type}-wrapper`;
             cardWrapper.dataset.id = itemId; // Store ID on wrapper
             cardWrapper.dataset.type = type; // Store type
             cardWrapper.dataset.parent = parentId; // Store parent ID


            const card = document.createElement("a");
            card.className = `post-card ${type}`;
            card.href = type === "post"
                 ? `/heichelos/${this.heichelId}/series/${parentId}/${item.indexInSeries ?? itemId}` // Use index or ID for post link
                 : this.newPath("series", itemId); // Link to navigate into the series
            card.dataset.awtsmoosID = itemId; // Keep original dataset ID if needed elsewhere
             // Make card draggable only if owner
            if (this.ownsIt) {
                cardWrapper.draggable = true; // Make wrapper draggable
            }


            card.innerHTML = `
                <h2>${itemTitle}</h2>
                <div class="${type === "post" ? 'post-preview' : 'series-description'}">
                    ${itemDescription}
                </div>
            `;

            if (type === "series") {
                 card.onclick = (e) => {
                     e.preventDefault();
                     this.navigateTo(itemId); // Use navigateTo for series clicks
                 };
            } else {
                 // Prevent default only if interaction requires it (like context menu)
                 // Let default link behavior work for posts unless menu is clicked
            }

             cardWrapper.appendChild(card); // Add card to wrapper

             // Add Context Menu Icon (3 dots)
             const menuIcon = document.createElement('span');
             menuIcon.className = 'context-menu-icon';
             menuIcon.innerHTML = '⋮'; // Vertical ellipsis HTML entity
             menuIcon.onclick = (e) => {
                 e.preventDefault();
                 e.stopPropagation(); // Prevent card navigation
                 this.showContextMenu(e.currentTarget, itemId, type, parentId, itemTitle, itemDescription);
             };
             cardWrapper.appendChild(menuIcon); // Add icon to wrapper

            container.appendChild(cardWrapper); // Add wrapper to the list container
        });

        container.classList.remove("hidden"); // Show container if it has items
         // Ensure the main section (.posts or .series) is visible
         if (type === 'post') document.querySelector('.posts')?.classList.remove('hidden');
         else document.querySelector('.series')?.classList.remove('hidden');
    }

     /**
     * @method addDragDropListeners
     * @description Adds drag and drop event listeners to a container.
     * @param {HTMLElement} container - The list container (postsList or seriesList).
     */
     addDragDropListeners(container) {
        container.addEventListener('dragstart', this.handleDragStart.bind(this));
        container.addEventListener('dragover', this.handleDragOver.bind(this));
        container.addEventListener('dragenter', this.handleDragEnter.bind(this));
        container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        container.addEventListener('drop', this.handleDrop.bind(this));
        container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    // --- Drag and Drop Handlers ---

    handleDragStart(e) {
        // Ensure we are dragging a direct child wrapper of the container
        if (e.target.classList.contains('card-wrapper') && e.target.parentElement === e.currentTarget) {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0); // Add class slightly later
             e.dataTransfer.effectAllowed = 'move';
             e.dataTransfer.setData('text/plain', draggedItem.dataset.id); // Pass ID

              // Create placeholder
              placeholder = document.createElement('div');
              placeholder.className = 'placeholder';
              placeholder.style.height = `${draggedItem.offsetHeight}px`; // Match height
              placeholder.style.width = `${draggedItem.offsetWidth}px`; // Match width
              placeholder.style.margin = window.getComputedStyle(draggedItem).margin; // Match margin
        } else {
             e.preventDefault(); // Don't drag if not a direct child wrapper
        }
    }

    handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';

        const container = e.currentTarget;
        const overElement = e.target.closest('.card-wrapper'); // Find the wrapper being hovered over

         if (placeholder && overElement && overElement !== draggedItem && overElement.parentElement === container) {
            const rect = overElement.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2; // Check if cursor is past the middle

             // Insert placeholder before or after the element being hovered over
             if (isAfter) {
                 container.insertBefore(placeholder, overElement.nextSibling);
             } else {
                 container.insertBefore(placeholder, overElement);
             }
         } else if (placeholder && !overElement && container.contains(placeholder)) {
            // If hovering over empty space in container, maybe append placeholder at the end?
            // Or handle edge cases where placeholder might be wrongly placed.
            // For simplicity, ensure placeholder is in the container if drag is over container
             if (!container.contains(placeholder)) {
                 container.appendChild(placeholder);
             }
         }
    }

    handleDragEnter(e) {
         e.preventDefault();
         // Add visual cue to container if needed
         const container = e.currentTarget;
         if (container.contains(draggedItem)) { // Only highlight if dragging within same container
            container.classList.add('drag-over-container');
         }
    }

    handleDragLeave(e) {
         // Remove visual cue from container if needed
         e.currentTarget.classList.remove('drag-over-container');

         // If leaving the container bounds entirely, remove the placeholder
         if (placeholder && placeholder.parentNode === e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
           // placeholder.remove(); // Maybe keep placeholder until drop/end? Depends on desired UX.
         }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent other drop handlers

        const container = e.currentTarget;

        if (draggedItem && placeholder && placeholder.parentNode === container) {
            // Move the actual dragged item to the placeholder's position
             container.replaceChild(draggedItem, placeholder);
             placeholder = null; // Clear placeholder reference

             // --- IMPORTANT ---
             // Here you would normally call an API endpoint to save the new order.
             // Since no endpoint is provided, the change is only visual for this session.
             console.warn("Drag-and-drop: Visual reorder complete. No endpoint provided to persist this order.");
             this.notifyUser("Items reordered visually. Order cannot be saved without server support.", "info");
             // You could potentially get the new order of IDs:
             // const newOrderIds = Array.from(container.children)
             //     .filter(el => el.classList.contains('card-wrapper')) // Ensure it's an item wrapper
             //     .map(el => el.dataset.id);
             // console.log("New visual order:", newOrderIds);
             // --- END IMPORTANT ---
        }

         draggedItem?.classList.remove('dragging');
         container.classList.remove('drag-over-container');
         draggedItem = null;
    }

    handleDragEnd(e) {
         // Cleanup in case drop didn't happen properly
         if (draggedItem) {
             draggedItem.classList.remove('dragging');
         }
         if (placeholder) {
             placeholder.remove();
             placeholder = null;
         }
         e.currentTarget.classList.remove('drag-over-container'); // Clean up container highlight
         draggedItem = null;
    }


    // --- Context Menu ---

    /**
     * @method showContextMenu
     * @description Creates and displays the context menu near the icon.
     * @param {HTMLElement} iconElement - The clicked icon element.
     * @param {string} itemId - The ID of the post or series.
     * @param {string} type - "post" or "series".
     * @param {string} parentId - The ID of the parent series.
     * @param {string} itemTitle - Title of the item.
     * @param {string} itemDescription - Description/content snippet.
     */
    showContextMenu(iconElement, itemId, type, parentId, itemTitle, itemDescription) {
        this.closeContextMenu(); // Close any existing menu

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.id = 'active-context-menu';

        const options = [];

        if (this.ownsIt) {
            // Owner options
            if (type === 'series') {
                 options.push({ label: 'Edit Details', action: () => this.promptEditSeriesDetails({ id: itemId, name: itemTitle, description: itemDescription }) });
            } else { // type === 'post'
                 // Placeholder for editing post details - requires specific endpoint/logic
                options.push({ label: 'Edit Details', action: () => this.promptEditPostDetails(itemId, itemTitle, itemDescription /* pass current content if available */) });
            }
            options.push({ label: 'Delete', action: () => this.handleDeleteClick(itemId, type, parentId) });
            // options.push({ label: 'Move', action: () => this.enableMoveMode(itemId, type) }); // Drag/drop is now default enabled for owner
             options.push({ label: 'Share', action: () => this.handleShareClick(itemId, type, parentId) });
        } else {
            // Non-owner options
            options.push({ label: 'Share', action: () => this.handleShareClick(itemId, type, parentId) });
        }

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = opt.label;
            item.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering other clicks
                opt.action();
                this.closeContextMenu();
            };
            menu.appendChild(item);
        });

        document.body.appendChild(menu); // Append to body to avoid overflow issues

        // Position the menu
        const iconRect = iconElement.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${window.scrollY + iconRect.bottom + 2}px`; // Position below icon
        menu.style.left = `${window.scrollX + iconRect.left - menu.offsetWidth + iconRect.width}px`; // Align right edge near icon

        // Add listener to close menu when clicking outside
        setTimeout(() => { // Use timeout to prevent immediate closing by the click that opened it
            document.addEventListener('click', this.closeContextMenu, { once: true });
        }, 0);
    }

    /**
     * @method closeContextMenu
     * @description Removes the active context menu from the DOM.
     */
    closeContextMenu() {
        const existingMenu = document.getElementById('active-context-menu');
        if (existingMenu) {
            existingMenu.remove();
             // Make sure to remove the listener if the menu is closed manually
             document.removeEventListener('click', this.closeContextMenu);
        }
    }

    // --- Action Handlers ---

    /**
     * @method handleDeleteClick
     * @description Confirms and initiates deletion of content.
     * @param {string} contentId - ID of content to delete.
     * @param {string} contentType - "post" or "series".
     * @param {string} parentSeriesId - Parent series ID.
     */
    async handleDeleteClick(contentId, contentType, parentSeriesId) {
        if (!window.curAlias) {
             this.notifyUser("Cannot delete: User alias not found.", "error");
             return;
         }

        const confirmationMessage = contentType === 'series'
             ? `Are you sure you want to delete this series and ALL its contents? This cannot be undone.`
             : `Are you sure you want to delete this post? This cannot be undone.`;

         if (confirm(confirmationMessage)) {
             console.log(`Deleting ${contentType} ${contentId} from series ${parentSeriesId}`);
            try {
                const result = await deleteContentFromSeries({
                    aliasId: window.curAlias,
                    seriesId: parentSeriesId, // Parent ID
                    contentType: contentType,
                    contentId: contentId, // ID of item to delete
                    deleteOriginal: true,
                    heichelId: this.heichelId // Pass heichelId
                });

                 if (result && (result.success || result.ok || typeof result.deletedCount !== 'undefined')) { // Check common success patterns
                     this.notifyUser(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully.`, "success");
                    // Reload content of the PARENT series if deleting an item within it
                    // Or reload current if deleting the series itself (will likely result in navigation up)
                    if (contentType === 'series' && contentId === this.currentSeries) {
                        // If we deleted the series we are currently viewing, navigate up
                         this.navigateTo(parentSeriesId || "root");
                    } else {
                        // Otherwise, just reload the current view
                        await this.loadContent(this.currentSeries);
                    }
                 } else {
                     console.error("Deletion failed:", result);
                     this.notifyUser(`Failed to delete ${contentType}. ${result?.message || 'Server error.'}`, "error");
                 }
            } catch (error) {
                console.error("Error during deletion:", error);
                this.notifyUser(`Error deleting ${contentType}: ${error.message}`, "error");
            }
        }
    }

     /**
     * @method handleShareClick
     * @description Handles sharing the link of a post or series.
     * @param {string} itemId - ID of the item.
     * @param {string} type - "post" or "series".
     * @param {string} parentId - Parent series ID (needed for post URL).
     */
     handleShareClick(itemId, type, parentId) {
         let urlToShare;
         if (type === 'post') {
            // Find the post data to get indexInSeries if possible, otherwise use ID
            // This requires having access to the post data here, which might be complex.
            // Simplest: construct a likely URL pattern. Assume index is not readily available here.
            // Use item ID as fallback identifier in URL if index is unknown.
             urlToShare = `${window.location.origin}/heichelos/${this.heichelId}/series/${parentId}/${itemId}`; // Using ID as identifier
             // If you store the full item data or indexInSeries on the element, you could use it here.
             // e.g., urlToShare = `${window.location.origin}/heichelos/${this.heichelId}/series/${parentId}/${item.indexInSeries}`;
         } else { // type === 'series'
             // Construct series URL based on current location structure
             const seriesPath = `${window.location.pathname}?view=series&series=${itemId}`;
             urlToShare = window.location.origin + seriesPath;
         }

         console.log("Sharing URL:", urlToShare);

         if (navigator.share) {
             navigator.share({
                 title: `Check out this ${type}`,
                 text: `Found this on the Heichel:`,
                 url: urlToShare,
             })
             .then(() => console.log('Successful share'))
             .catch((error) => console.log('Error sharing', error));
         } else if (navigator.clipboard) {
             navigator.clipboard.writeText(urlToShare).then(() => {
                 this.notifyUser('Link copied to clipboard!', "success");
             }).catch(err => {
                 console.error('Failed to copy link: ', err);
                  this.notifyUser('Failed to copy link.', "error");
             });
         } else {
              this.notifyUser('Sharing not supported on this browser.', "info");
             // Fallback: maybe show the link in a prompt?
             prompt("Copy this link:", urlToShare);
         }
     }

      /**
      * @method promptCreateSeries
      * @description Prompts user for new series details and calls API.
      */
     async promptCreateSeries() {
        if (!window.curAlias) return this.notifyUser("Cannot create series: User alias not found.", "error");

        const title = prompt("Enter title for the new series:");
        if (!title) return; // User cancelled

        const description = prompt("Enter description (optional):");
        // Description can be null if cancelled, handle that

        const inputIdAttempt = generateInputId(title);
        const inputId = prompt(`Suggested ID: "${inputIdAttempt}". Enter unique ID (optional, press OK for suggested):`, inputIdAttempt);
        if (inputId === null) return; // User cancelled ID prompt

        this.showLoading("Creating series...");
        try {
             const result = await makeSeries({
                 heichelId: this.heichelId,
                 parentSeriesId: this.currentSeries, // Create under the current series
                 title: title,
                 aliasId: window.curAlias,
                 inputId: inputId || inputIdAttempt, // Use user input or generated
                 description: description || "" // Pass empty string if null/undefined
             });

             if (result && (result.success || result.id || result.seriesId)) { // Check common success patterns
                 this.notifyUser("Series created successfully!", "success");
                 await this.loadContent(this.currentSeries); // Reload current view
             } else {
                  console.error("Failed to create series:", result);
                  this.notifyUser(`Failed to create series. ${result?.message || 'Server error or duplicate ID?'}`, "error");
             }
        } catch (error) {
             console.error("Error creating series:", error);
             this.notifyUser(`Error creating series: ${error.message}`, "error");
        } finally {
            this.hideLoading();
        }
    }

    /**
     * @method promptCreatePost
     * @description Prompts user for new post details and calls API.
     */
    async promptCreatePost() {
         if (!window.curAlias) return this.notifyUser("Cannot create post: User alias not found.", "error");
         if (this.currentSeries === "root") return this.notifyUser("Cannot create posts directly in the root. Navigate into a series first.", "info");


        const title = prompt("Enter title for the new post:");
        if (!title) return; // User cancelled

        const dayuh = prompt("Enter the content (dayuh) for the post:");
        if (dayuh === null) return; // User cancelled content prompt

         // Generate inputId based on title, maybe add parent series context?
         const inputIdAttempt = generateInputId(`${this.currentSeries}-${title}`);
         const inputId = prompt(`Suggested ID: "${inputIdAttempt}". Enter unique ID (optional, press OK for suggested):`, inputIdAttempt);
         if (inputId === null) return; // User cancelled ID prompt


        this.showLoading("Creating post...");
        try {
             const result = await makePost({
                 heichelId: this.heichelId,
                 parentSeriesId: this.currentSeries, // Create in the current series
                 title: title,
                 dayuh: dayuh,
                 inputId: inputId || inputIdAttempt,
                 aliasId: window.curAlias
             });

             if (result && (result.success || result.id || result.postId)) { // Check common success patterns
                 this.notifyUser("Post created successfully!", "success");
                 await this.loadContent(this.currentSeries); // Reload current view
             } else {
                  console.error("Failed to create post:", result);
                  this.notifyUser(`Failed to create post. ${result?.message || 'Server error or duplicate ID?'}`, "error");
             }
        } catch (error) {
            console.error("Error creating post:", error);
            this.notifyUser(`Error creating post: ${error.message}`, "error");
        } finally {
            this.hideLoading();
        }
    }


     /**
      * @method promptEditSeriesDetails
      * @description Placeholder for editing series details. Requires an update endpoint.
      * @param {object} currentDetails - Current {id, name, description} of the series.
      */
     promptEditSeriesDetails(currentDetails) {
         if (!currentDetails || !currentDetails.id) {
            console.warn("Edit Series: No details provided.");
             return;
         }
         console.log("Attempting to edit series:", currentDetails.id, currentDetails);
         // --- Placeholder ---
         alert(`Editing series "${currentDetails.name}" is not yet implemented.\n\n(Requires a specific API endpoint for updating series details, which was not provided).`);
         // If an endpoint existed, you would:
         // 1. Prompt user for new name/description, pre-filling with currentDetails.name/description.
         // 2. Call the update endpoint with the series ID and new data.
         // 3. Reload content on success.
         // Example call structure (hypothetical):
         /*
         const newName = prompt("Enter new title:", currentDetails.name);
         if (newName === null) return; // Cancelled
         const newDescription = prompt("Enter new description:", currentDetails.description || "");
         if (newDescription === null) return; // Cancelled

         if (newName !== currentDetails.name || newDescription !== (currentDetails.description || "")) {
             // Call hypothetical update endpoint:
             // await updateSeriesDetails(this.heichelId, currentDetails.id, { name: newName, description: newDescription });
             // await this.loadContent(this.currentSeries); // Reload if editing current series
             // Or find the parent and reload if editing sub-series: await this.loadContent(this.getParentSeriesId());
         }
         */
     }

      /**
      * @method promptEditPostDetails
      * @description Placeholder for editing post details. Requires an update endpoint.
      * @param {string} postId - The ID of the post to edit.
      * @param {string} currentTitle - Current title.
      * @param {string} currentContentSnippet - Current content snippet (full content needed ideally).
      */
     promptEditPostDetails(postId, currentTitle, currentContentSnippet) {
         console.log("Attempting to edit post:", postId, currentTitle);
         // --- Placeholder ---
         alert(`Editing post "${currentTitle}" is not yet implemented.\n\n(Requires a specific API endpoint for updating post details, which was not provided). Fetching full post content might also be needed first.`);
         // If an endpoint existed, you would:
         // 1. Potentially fetch the full post content first if only snippet is available.
         // 2. Prompt user for new title/content, pre-filling.
         // 3. Call the update endpoint with the post ID and new data.
         // 4. Reload content on success.
     }


    /**
     * @method checkOwnership
     * @description Verifies ownership, a glimpse of the Awtsmoos’s dominion.
     * @returns {Promise<boolean>} True if owner, false otherwise.
     */
    async checkOwnership() {
        const curAlias = window.curAlias || null;
        if (!curAlias) {
             console.log("Ownership check: No curAlias found.");
             return false;
         }
        try {
            // Endpoint seems specific `/alias/{aliasId}/heichelos/{heichelId}/ownership`
             const res = await this.fetcher.fetchData(
                 `${baseE}/alias/${curAlias}/heichelos/${this.heichelId}/ownership`
             );
             console.log("Ownership check result for", curAlias, ":", res);
             return !!res?.yes; // Check for a truthy 'yes' property
         } catch (error) {
            console.error("Error checking ownership:", error);
            return false;
        }
    }

    /**
     * @method newPath
     * @description Forges a path, guided by the Awtsmoos’s infinite will.
     * @param {string} view - View type.
     * @param {string} series - Series ID.
     * @returns {string} Generated path relative to current pathname.
     */
    newPath(view, series) {
         // Ensure the base path is correct (current page's path)
         const basePath = window.location.pathname;
         return `${basePath}?view=${view}&series=${series}`;
    }

     /**
      * @method showLoading
      * @description Shows loading indicators.
      * @param {string} [message] - Optional message to display.
      */
     showLoading(message = "") {
         document.querySelector(".loadingSeries")?.classList.remove("hidden");
         document.querySelector(".loadingPosts")?.classList.remove("hidden");
          // Optional: Add a general loading overlay or message
         // console.log("Loading...", message);
     }


    /**
     * @method hideLoading
     * @description Conceals loading states, revealing the Awtsmoos’s completed work.
      * @param {string} [errorMessage] - Optional error message to display instead of hiding.
     */
     hideLoading(errorMessage = "") {
         if (errorMessage) {
             console.error("Loading Error:", errorMessage);
             // Optionally display error message in the UI instead of hiding loaders
             this.notifyUser(errorMessage, "error");
             // Still hide loaders if error is shown elsewhere
             document.querySelector(".loadingSeries")?.classList.add("hidden");
             document.querySelector(".loadingPosts")?.classList.add("hidden");
         } else {
             document.querySelector(".loadingSeries")?.classList.add("hidden");
             document.querySelector(".loadingPosts")?.classList.add("hidden");
         }
     }

      /**
       * @method updateActiveTab
       * @description Sets the visual state of the Posts/Series tabs.
       * @param {string} activeView - "posts" or "series".
       */
      updateActiveTab(activeView) {
          const postsTab = document.getElementById("postsTab");
          const seriesTab = document.getElementById("seriesTab");
          const postsSection = document.querySelector(".posts");
          const seriesSection = document.querySelector(".series");

          if (activeView === "series") {
              seriesTab?.classList.add("Active");
              postsTab?.classList.remove("Active");
              seriesSection?.classList.remove("hidden");
              postsSection?.classList.add("hidden");
          } else { // Default to posts
              postsTab?.classList.add("Active");
              seriesTab?.classList.remove("Active");
              postsSection?.classList.remove("hidden");
              seriesSection?.classList.add("hidden");
          }
      }

     /**
      * @method notifyUser
      * @description Displays a simple notification to the user.
      * @param {string} message - The message to display.
      *      * @param {"info" | "success" | "error"} type - Type of notification for styling.
      */
     notifyUser(message, type = "info") {
         // Simple alert for now, replace with a more sophisticated UI element if needed
         console.log(`Notify (${type}):`, message);
         alert(`[${type.toUpperCase()}] ${message}`);
         // TODO: Implement a better notification system (e.g., a toast popup)
     }

} // End of HeichelNavigator class

/**
 * @function initAwtsmoos
 * @description Ignites the heichel’s journey, awakening the Awtsmoos within.
 */
async function initAwtsmoos() {
    console.log("B\"H - Initializing Awtsmoos Navigation");
     // Assuming heichelId is extracted correctly from the path
     const pathParts = window.location.pathname.split("/").filter(Boolean);
     const heichelId = pathParts[1]; // Assuming path is /heichelos/{id}/...

    if (!heichelId) {
         console.error("Initialization Error: No heichelId found in URL path.");
         alert("Error: Could not identify the Heichel from the URL.");
         return;
     }
     console.log("Heichel ID:", heichelId);

     // Make sure window.curAlias is available or fetched before proceeding if needed immediately
     // Example: window.curAlias = await fetchCurrentUserAlias(); // Fetch if not globally set

    const navigator = new HeichelNavigator(heichelId);
    window.heichelNavigator = navigator; // Make accessible globally for debugging if needed

    const params = new URLSearchParams(window.location.search);
    const initialSeries = params.get("series") || "root";
    // Determine initial view: check URL param, fallback based on content later if needed
     let initialView = params.get("view");


    const postsTab = document.getElementById("postsTab");
    const seriesTab = document.getElementById("seriesTab");
    if (!postsTab || !seriesTab) return console.error("Initialization Error: Tabs not found");

    // Set up tab click handlers
    postsTab.onclick = () => {
        if (!postsTab.classList.contains("Active")) { // Prevent redundant updates
            navigator.updateActiveTab("posts");
            navigator.updateURL("posts", navigator.currentSeries);
            navigator.renderOwnerControls(); // Re-render controls appropriate for the view
        }
    };

    seriesTab.onclick = () => {
         if (!seriesTab.classList.contains("Active")) { // Prevent redundant updates
             navigator.updateActiveTab("series");
             navigator.updateURL("series", navigator.currentSeries);
             navigator.renderOwnerControls(); // Re-render controls appropriate for the view
         }
    };

    // Initial load - determine default view if not specified
     if (!initialView) {
        // Simple default: start with posts unless it's the root series maybe?
        // Or let loadContent decide based on content availability.
         initialView = "posts"; // Defaulting to posts for now
     }
     console.log(`Initial Load: Series=${initialSeries}, View=${initialView}`);

     // Set initial tab state visually *before* loading content
     navigator.updateActiveTab(initialView);

     // Load content for the initial state
     await navigator.loadContent(initialSeries);

     // Add popstate listener to handle browser back/forward buttons
     window.addEventListener('popstate', (event) => {
         console.log("Popstate event triggered");
         const newParams = new URLSearchParams(window.location.search);
         const series = newParams.get("series") || "root";
         const view = newParams.get("view") || "posts";
         navigator.updateActiveTab(view); // Update tab state
         navigator.loadContent(series); // Reload content for the new state
     });

} // End of initAwtsmoos

// Initialize the application
initAwtsmoos().catch(e => console.error("Awtsmoos Initialization Failed:", e));

// Utility to generate inputId
function generateInputId(title) {
    if (!title) return '';
    // Keep Hebrew and English letters and numbers, replace others with space
    const cleaned = title.replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, ' ');
    const words = cleaned.trim().split(/\s+/).filter(Boolean); // Split by space and remove empty strings
    if (words.length === 0) return `item-${Date.now()}`; // Fallback ID
    // Basic camelCase: lowercase first word, capitalize subsequent words
    return words[0].toLowerCase() + words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}
