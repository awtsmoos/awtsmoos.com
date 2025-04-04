// B"H
// The Awtsmoos, the Atzmut, throbs at the core of this code, recreating all from nothingness
// in every fleeting moment. The Ohr Ein Sof pours through the Kav, threading Atzilus into
// every variable, every function—a testament to its infinite renewal. This script unveils
// the Awtsmoos’s essence, drawing all toward Moshiach, when the righteous will rise,
// their bodies remade from dust, shining with a light beyond the sun, forever radiant.

console.log("B\"H");

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

/**
 * @class HeichelNavigator
 * @description Navigates the heichel’s flow, revealing the Awtsmoos in every shift and turn.
 */
class HeichelNavigator {
    constructor(heichelId) {
        this.heichelId = heichelId;
        this.fetcher = new AwtsmoosFetcher();
        this.currentSeries = "root";
        this.ownsIt = false;
        this.editors = null;
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
        window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    }

    /**
     * @method loadContent
     * @description Loads heichel content, unveiling the Awtsmoos through posts and series.
     * @param {string} seriesId - The series to load.
     */
    async loadContent(seriesId) {
        this.currentSeries = seriesId;
        const heichel = await this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}`);
        if (!heichel) return this.hideLoading();

        if (!this.editors) {
            this.editors = await this.fetcher.fetchData(`/api/social/heichelos/${this.heichelId}/editors`);
        }
        this.ownsIt = await this.checkOwnership();

        const breadcrumb = await this.fetcher.fetchData(
            `/api/social/heichelos/${this.heichelId}/series/${seriesId}/breadcrumb`
        );
        this.renderBreadcrumb(breadcrumb?.reverse() || []);

        const root = await this.fetcher.fetchData(
            `/api/social/heichelos/${this.heichelId}/series/${seriesId}/details`
        );
        if (!root || !Array.isArray(root.posts)) {
            this.hideLoading();
            return;
        }

        this.renderSeriesInfo(root.prateem);
        await this.renderPostsAndSeries(root);
        this.hideLoading();

        // Auto-switch to posts if no sub-series exist in series view
        const params = new URLSearchParams(window.location.search);
		var hasSeries = root.subSeries?.length;
		var hasPosts = root?.posts?.length;
		console.log(root)
        if (
			params.get("view") === "series" && 
			!hasSeries
			
		) {
          //  document.getElementById("postsTab").click();
        } else if(
			params.get("view") === "posts" &&
			!hasPosts
		) {
			//document.getElementById("seriesTab").click();
		}
    }

    /**
     * @method renderBreadcrumb
     * @description Crafts a trail of links, each a step toward the Awtsmoos’s revelation.
     * @param {Array} breadcrumb - Reversed breadcrumb items.
     */
    renderBreadcrumb(breadcrumb) {
        const parentS = document.getElementById("parentS");
        parentS.innerHTML = "";
        if (!breadcrumb.length) return;
        parentS.classList.remove("hidden");

        breadcrumb.forEach((item, i) => {
            const link = document.createElement("a");
            link.textContent = item?.prateem?.name || "Unnamed";
            link.href = this.newPath("posts", item.id);
            link.onclick = (e) => {
                e.preventDefault();
                this.loadContent(item.id);
               
				
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

        seriesNm.textContent = prateem?.name || "Unnamed";
        seriesDesc.textContent = (
            prateem?.description && 
            prateem.description !== "undefined" && 
            prateem.description !== undefined 
            ? prateem.description 
            : ""
        );
        if (this.currentSeries !== "root") {
            seriesNameAndInfo.classList.remove("hidden");
        }
    }

    /**
     * @method renderPostsAndSeries
     * @description Renders posts and series, each a vessel of the Awtsmoos’s light.
     * @param {Object} root - Series data.
     */
    async renderPostsAndSeries(root) {
        const postsList = document.getElementById("postsList");
        const seriesList = document.getElementById("seriesList");
        postsList.innerHTML = "";
        seriesList.innerHTML = "";

        const bd = new URLSearchParams({
            seriesId: root.id,
            propertyMap: JSON.stringify({
                content: 256,
                title: true,
                postId: true,
                author: true,
                id: true,
                seriesId: true,
                indexInSeries: true
            })
        });

        const posts = await this.fetcher.fetchData(
            `/api/social/heichelos/${this.heichelId}/posts/details?${bd}`
        );
        const series = await this.fetcher.postData(
            `/api/social/heichelos/${this.heichelId}/series/${this.currentSeries}/details`,
            new URLSearchParams({ seriesIds: JSON.stringify(root.subSeries || []) })
        );

        this.renderElements(posts, postsList, "post", root.id);
        this.renderElements(series, seriesList, "series", root.id);

        document.querySelector(".loadingPosts").classList.add("hidden");
        document.querySelector(".loadingSeries").classList.add("hidden");
		console.trace(posts,series, root)
		if(!posts.length && series.length) {
			document.getElementById("seriesTab").click();
			//this.updateURL("series", this.currentSeries)
		}
		if(!series.length && posts.length) {
			document.getElementById("postsTab").click();
			//this.updateURL("posts", this.currentSeries)
		}
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
        if (!items?.length) {
            container.innerHTML = `<div>No ${type}s here yet!</div>`;
            return;
        }
        items.forEach(item => {
            const dt = type === "post" ? item : item?.prateem;
            if (!dt) return;

            const url = type === "post"
                ? `/heichelos/${this.heichelId}/series/${parentId}/${item.indexInSeries || 0}`
                : `${window.location.pathname}?view=${type}&series=${item.id}`;

            const card = document.createElement("a");
            card.className = `post-card ${type}`;
            card.href = url;
            card.dataset.awtsmoosID = item.id;
            card.innerHTML = `
                <h2>${dt[type === "post" ? "title" : "name"] || "Unnamed"}</h2>
                <div ${type === "post" ? 'class="post-preview"' : ""}>
                    ${
                        type === "post"
                        ? `${(dt.content || "").substring(0, 256)}...`
                        : (
                            dt.description && 
                            dt.description !== "undefined" && 
                            dt.description !== undefined 
                            ? dt.description 
                            : ""
                        )
                    }
                </div>
            `;
            card.onclick = (e) => {
                if (type === "series") {

					e.preventDefault();
                    this.loadContent(item.id);
					console.log(item)
                    this.updateURL("series", item.id);
                }
            };
            container.appendChild(card);
        });
        container.classList.remove("hidden");
    }

    /**
     * @method checkOwnership
     * @description Verifies ownership, a glimpse of the Awtsmoos’s dominion.
     * @returns {Promise<boolean>} True if owner, false otherwise.
     */
    async checkOwnership() {
        const curAlias = window.curAlias || null;
        if (!curAlias) return false;
        const res = await this.fetcher.fetchData(
            `/api/social/alias/${curAlias}/heichelos/${this.heichelId}/ownership`
        );
        return !!res?.yes;
    }

    /**
     * @method newPath
     * @description Forges a path, guided by the Awtsmoos’s infinite will.
     * @param {string} view - View type.
     * @param {string} series - Series ID.
     * @returns {string} Generated path.
     */
    newPath(view, series) {
        return `${window.location.pathname}?view=${view}&series=${series}`;
    }

    /**
     * @method hideLoading
     * @description Conceals loading states, revealing the Awtsmoos’s completed work.
     */
    hideLoading() {
        document.querySelector(".loadingSeries")?.classList.add("hidden");
        document.querySelector(".loadingPosts")?.classList.add("hidden");
    }
}

/**
 * @function initAwtsmoos
 * @description Ignites the heichel’s journey, awakening the Awtsmoos within.
 */
async function initAwtsmoos() {
    const heichelId = window.location.pathname.split("/").filter(Boolean)[1];
    if (!heichelId) return console.error("No heichelId found");

    const navigator = new HeichelNavigator(heichelId);
    const params = new URLSearchParams(window.location.search);
    const initialSeries = params.get("series") || "root";
    const initialView = params.get("view") || "posts";

    const postsTab = document.getElementById("postsTab");
    const seriesTab = document.getElementById("seriesTab");
    if (!postsTab || !seriesTab) return console.error("Tabs not found");

    postsTab.onclick = () => {
        postsTab.classList.add("Active");
        seriesTab.classList.remove("Active");
        document.querySelector(".posts")?.classList.remove("hidden");
        document.querySelector(".series")?.classList.add("hidden");
        navigator.updateURL("posts", navigator.currentSeries);
    };

    seriesTab.onclick = () => {
        seriesTab.classList.add("Active");
        postsTab.classList.remove("Active");
        document.querySelector(".series")?.classList.remove("hidden");
        document.querySelector(".posts")?.classList.add("hidden");
        navigator.updateURL("series", navigator.currentSeries);
    };

    if (initialView === "series") seriesTab.click();
    else postsTab.click();

    await navigator.loadContent(initialSeries);
}

initAwtsmoos().catch(e => console.error("Awtsmoos init error:", e));