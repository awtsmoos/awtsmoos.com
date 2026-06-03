// B"H
/**
 * @module TabManagerCore
 * @description
 * Chapter 121: No inline style decree remains in the crown.
 * The Awtsmoos lets state become class and attribute. The shell title names the
 * current chamber; the local row appears only when a back path exists.
 */

import { createSidebarShell } from "/heichelos/post/tabs/manager/shell.js";
import { createChamberDOM } from "/heichelos/post/tabs/manager/chamber.js";
import { renderBreadcrumbs } from "/heichelos/post/tabs/manager/breadcrumbs.js";
import { slideIn, slideOut } from "/heichelos/post/tabs/manager/transitions.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";

function createGlobalClose(onclose) {
    return () => {
        updateQueryStringParameter("panel", null);
        updateQueryStringParameter("u", null);
        onclose?.();
    };
}

function getTabName(options) {
    return options.name || options.header.toLowerCase().replace(/\s+/g, "-");
}

export default class TabManager {
    constructor({ parent, headerTxt = "Divine Context", onclose = () => {} } = {}) {
        if (!parent) throw new Error("B\"H - TabManager requires a parent vessel.");
        this.onGlobalClose = createGlobalClose(onclose);
        this.stack = [];
        this.registry = new Map();
        this.rootTitle = headerTxt;
        const elements = createSidebarShell(parent, headerTxt, this.onGlobalClose);
        this.viewport = elements.viewport;
        this.navBar = elements.navBar;
        this.titleEl = elements.titleEl;
        this.titleEl.onclick = () => { if (this.stack.length > 1) this.pop(); };
    }

    addTab(options) {
        const tabName = getTabName(options);
        const tabObj = { ...options, header: options.header || "Realm", name: tabName, ...createChamberDOM(options, () => this.pop()) };
        tabObj.actual = tabObj.scrollArea;
        tabObj.open = () => this.push(tabObj);
        tabObj.onUpdateHeader = txt => this.updateTabHeader(tabObj, txt);
        this.registry.set(tabName, tabObj);
        if (typeof options.oninit === "function") options.oninit(tabObj);
        return tabObj;
    }

    async openByName(name) {
        const tab = this.registry.get(name);
        if (!tab) return null;
        await this.push(tab);
        return tab;
    }

    getCurrent() { return this.stack[this.stack.length - 1] || null; }
    getTabs() { return [...this.stack]; }

    updateTabHeader(tabObj, txt) {
        tabObj.subTitle.innerText = txt;
        tabObj.header = txt;
        this.updateCrumbs();
    }

    enforceBackBtnState(tabObj) {
        if (!tabObj) return;
        const hasBack = this.stack.length > 1;
        if (tabObj.backBtn) tabObj.backBtn.hidden = !hasBack;
        if (tabObj.subTitle) tabObj.subTitle.hidden = !hasBack;
        tabObj.dom?.classList.toggle("has-back", hasBack);
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
        const current = this.getCurrent();
        if (this.titleEl) {
            this.titleEl.textContent = current?.header || this.rootTitle;
            this.titleEl.classList.toggle("can-go-back", this.stack.length > 1);
        }
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
