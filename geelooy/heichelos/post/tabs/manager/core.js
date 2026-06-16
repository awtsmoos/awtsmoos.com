// B"H
/**
 * @module TabManagerCore
 * @description
 * Chapter 357: Returning to a chamber reopens its soul.
 * If a tab is already in the stack, the Awtsmoos still makes it visible and
 * reruns its opener when its vessel is empty, so menus cannot go hollow.
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

function getTabName(options) { return options.name || options.header.toLowerCase().replace(/\s+/g, "-"); }
function needsRefresh(tab) { return tab?.name === "rootMenu" || !tab?.actual?.childElementCount; }

export default class TabManager {
    constructor({ parent, headerTxt = "Divine Context", onclose = () => {} } = {}) {
        if (!parent) throw new Error("B\"H - TabManager requires a parent vessel.");
        this.onGlobalClose = createGlobalClose(onclose);
        this.stack = [];
        this.registry = new Map();
        this.rootTitle = headerTxt;
        const shell = createSidebarShell(parent, headerTxt, this.onGlobalClose);
        this.viewport = shell.viewport;
        this.navBar = shell.navBar;
        this.titleEl = shell.titleEl;
        this.titleEl.onclick = () => { if (this.stack.length > 1) this.pop(); };
    }

    addTab(options) {
        const name = getTabName(options);
        const tab = { ...options, header: options.header || "Realm", name, ...createChamberDOM(options, () => this.pop()) };
        tab.actual = tab.scrollArea;
        tab.open = () => this.push(tab);
        tab.onUpdateHeader = txt => this.updateTabHeader(tab, txt);
        this.registry.set(name, tab);
        if (typeof options.oninit === "function") options.oninit(tab);
        return tab;
    }

    getCurrent() { return this.stack[this.stack.length - 1] || null; }
    getTabs() { return [...this.stack]; }

    async openByName(name) {
        const tab = this.registry.get(name);
        if (!tab) return null;
        await this.push(tab);
        return tab;
    }

    updateTabHeader(tab, txt) {
        tab.subTitle.innerText = txt;
        tab.header = txt;
        this.updateCrumbs();
    }

    enforceBackBtnState(tab) {
        if (!tab) return;
        const hasBack = this.stack.length > 1;
        tab.backBtn.hidden = !hasBack;
        tab.subTitle.hidden = !hasBack;
        tab.dom?.classList.toggle("has-back", hasBack);
    }

    syncUrl(tab) {
        if (!tab) {
            updateQueryStringParameter("panel", null);
            updateQueryStringParameter("u", null);
            return;
        }
        updateQueryStringParameter("panel", tab.name);
        const viewingAlias = tab.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed;
        updateQueryStringParameter("u", viewingAlias ? window.currentAliasBeingViewed : null);
    }

    updateCrumbs() {
        const current = this.getCurrent();
        this.titleEl.textContent = current?.header || this.rootTitle;
        this.titleEl.classList.toggle("can-go-back", this.stack.length > 1);
        renderBreadcrumbs(this.navBar, this.stack, index => {
            while (this.stack.length - 1 > index) this.pop(true);
        });
    }

    async awaken(tab) {
        this.enforceBackBtnState(tab);
        slideIn(tab, null, this.viewport);
        this.updateCrumbs();
        this.syncUrl(tab);
        if (tab.onopen && needsRefresh(tab)) await tab.onopen({ tab, actualTab: tab.actual });
    }

    async push(tab) {
        if (this.stack.includes(tab)) {
            const index = this.stack.indexOf(tab);
            while (this.stack.length - 1 > index) await this.pop(true);
            await this.awaken(tab);
            return;
        }
        const current = this.getCurrent();
        this.stack.push(tab);
        this.enforceBackBtnState(tab);
        slideIn(tab, current, this.viewport);
        this.updateCrumbs();
        this.syncUrl(tab);
        if (tab.onopen) await tab.onopen({ tab, actualTab: tab.actual });
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