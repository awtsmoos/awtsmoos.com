// /BH/awtsmoos.com/geelooy/heichelos/post/tabs/manager/core.js
//B"H
/**
 * @file core.js
 * @description
 * Chapter 48: The Awtsmoos reveals that a chamber is not merely appended; it
 * must be crowned as the one living view. This manager keeps a real registry of
 * tabs, opens portals by name, marks the active vessel, and lets mobile fingers
 * strike a menu row once and immediately see the chosen panel instead of a
 * ghostly stack of overlapping worlds.
 */
import { createSidebarShell } from "/heichelos/post/tabs/manager/shell.js";
import { createChamberDOM } from "/heichelos/post/tabs/manager/chamber.js";
import { renderBreadcrumbs } from "/heichelos/post/tabs/manager/breadcrumbs.js";
import { slideIn, slideOut } from "/heichelos/post/tabs/manager/transitions.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";

/**
 * Guards query-string cleanup when the side palace closes.
 * @param {Function} onclose A consumer close callback.
 * @returns {Function} A close ritual with no arguments.
 */
function createGlobalClose(onclose) {
    return () => {
        updateQueryStringParameter("panel", null);
        updateQueryStringParameter("u", null);
        if (onclose) onclose();
    };
}

/**
 * Returns the canonical tab key from user-provided options.
 * @param {object} options Tab options.
 * @returns {string} Stable tab name.
 */
function getTabName(options) {
    return options.name || options.header.toLowerCase().replace(/\s+/g, "-");
}

/**
 * The living stack and registry for the sidebar chambers.
 */
export default class TabManager {
    /**
     * @param {object} options Construction options.
     * @param {Element} options.parent Sidebar root element.
     * @param {string} [options.headerTxt] Sidebar crown title.
     * @param {Function} [options.onclose] Callback invoked on close.
     */
    constructor({ parent, headerTxt = "Divine Context", onclose = () => {} } = {}) {
        if (!parent) throw new Error("B\"H - TabManager requires a parent vessel.");
        this.onGlobalClose = createGlobalClose(onclose);
        this.stack = [];
        this.registry = new Map();
        const elements = createSidebarShell(parent, headerTxt, this.onGlobalClose);
        this.viewport = elements.viewport;
        this.navBar = elements.navBar;
    }

    /**
     * Registers one chamber and returns its public controls.
     * @param {object} options Tab configuration.
     * @returns {object} Tab object with an open method.
     */
    addTab(options) {
        const tabName = getTabName(options);
        const tabObj = {
            ...options,
            header: options.header || "Realm",
            name: tabName,
            ...createChamberDOM(options, () => this.pop())
        };
        tabObj.actual = tabObj.scrollArea;
        tabObj.open = () => this.push(tabObj);
        tabObj.onUpdateHeader = txt => this.updateTabHeader(tabObj, txt);
        this.registry.set(tabName, tabObj);
        if (typeof options.oninit === "function") options.oninit(tabObj);
        return tabObj;
    }

    /**
     * Opens a tab by name when a URL or menu knows only the key.
     * @param {string} name Registered tab name.
     * @returns {Promise<object|null>} Opened tab, or null if absent.
     */
    async openByName(name) {
        const tab = this.registry.get(name);
        if (!tab) return null;
        await this.push(tab);
        return tab;
    }

    /** @returns {object|null} The current visible tab. */
    getCurrent() { return this.stack[this.stack.length - 1] || null; }

    /** @returns {object[]} Copy of the visible stack. */
    getTabs() { return [...this.stack]; }

    updateTabHeader(tabObj, txt) {
        tabObj.subTitle.innerText = txt;
        tabObj.header = txt;
        this.updateCrumbs();
    }

    enforceBackBtnState(tabObj) {
        if (!tabObj?.backBtn) return;
        tabObj.backBtn.style.setProperty("display", this.stack.length > 1 ? "flex" : "none", "important");
    }

    syncUrl(tabObj) {
        if (!tabObj) {
            updateQueryStringParameter("panel", null);
            updateQueryStringParameter("u", null);
            return;
        }
        updateQueryStringParameter("panel", tabObj.name);
        const viewingAlias = tabObj.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed;
        updateQueryStringParameter("u", viewingAlias ? window.currentAliasBeingViewed : null);
    }

    updateCrumbs() {
        renderBreadcrumbs(this.navBar, this.stack, index => {
            while (this.stack.length - 1 > index) this.pop(true);
        });
    }

    async push(tabObj) {
        if (this.stack.includes(tabObj)) {
            const idx = this.stack.indexOf(tabObj);
            while (this.stack.length - 1 > idx) await this.pop(true);
            this.enforceBackBtnState(tabObj);
            this.syncUrl(tabObj);
            this.updateCrumbs();
            return;
        }
        const current = this.getCurrent();
        this.stack.push(tabObj);
        this.enforceBackBtnState(tabObj);
        slideIn(tabObj, current, this.viewport);
        this.updateCrumbs();
        this.syncUrl(tabObj);
        if (tabObj.onopen) await tabObj.onopen({ tab: tabObj, actualTab: tabObj.actual });
    }

    async pop(isInternalJump = false) {
        if (this.stack.length <= 1 && !isInternalJump) return;
        const leaving = this.stack.pop();
        const returning = this.getCurrent();
        if (leaving?.onclose) await leaving.onclose();
        slideOut(leaving, returning, this.viewport);
        if (returning) {
            this.enforceBackBtnState(returning);
            this.syncUrl(returning);
        } else if (!isInternalJump) this.syncUrl(null);
        this.updateCrumbs();
    }
}
