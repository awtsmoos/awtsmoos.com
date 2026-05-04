
/**
 * B"H
 * @module TabController
 * @description
 * Manages the shifting between states (Posts vs Series).
 * Updates the physical DOM classes and the URL query parameters 
 * without forcing a heavy reload.
 */

import { HeichelState } from "./HeichelState.js";

export class TabController {
    static init() {
        const postsTab = document.getElementById('postsTab');
        const seriesTab = document.getElementById('seriesTab');

        if (postsTab) {
            postsTab.onclick = () => this.switchToPosts(postsTab, seriesTab);
        }

        if (seriesTab) {
            seriesTab.onclick = () => this.switchToSeries(postsTab, seriesTab);
        }

        if (HeichelState.view === "series" && seriesTab) {
            seriesTab.click();
        } else if (postsTab) {
            postsTab.click();
        }
    }

    static switchToPosts(postsTab, seriesTab) {
        postsTab.classList.add("Active");
        seriesTab.classList.remove("Active");
        this.updateSearch("view", "posts");

        document.querySelector(".posts")?.classList.remove("hidden");
        document.getElementById('postsList')?.classList.remove("hidden");
        document.querySelector(".series")?.classList.add("hidden");
        document.getElementById('seriesList')?.classList.add("hidden");
    }

    static switchToSeries(postsTab, seriesTab) {
        seriesTab.classList.add("Active");
        postsTab.classList.remove("Active");
        this.updateSearch("view", "series");

        document.querySelector(".posts")?.classList.add("hidden");
        document.getElementById('postsList')?.classList.add("hidden");
        document.querySelector(".series")?.classList.remove("hidden");
        document.getElementById('seriesList')?.classList.remove("hidden");
    }

    static updateSearch(name, value) {
        const c = new URLSearchParams(location.search);
        c.set(name, value);
        const newUrl = window.location.pathname + '?' + c.toString();
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }
}
