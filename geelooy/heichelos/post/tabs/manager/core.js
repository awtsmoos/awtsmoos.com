// /BH/awtsmoos.com/geelooy/heichelos/post/tabs/manager/core.js
//B"H
import { createSidebarShell } from "./shell.js";
import { createChamberDOM } from "./chamber.js";
import { renderBreadcrumbs } from "./breadcrumbs.js";
import { slideIn, slideOut } from "./transitions.js";
import { updateQueryStringParameter } from "../../functions/utils.js"; 

export default class TabManager {
    constructor({ parent, headerTxt = "Divine Context", onclose = () => {} } = {}) {
        if (!parent) throw new Error("B\"H - TabManager requires a parent vessel.");
        
        this.onGlobalClose = () => {
            updateQueryStringParameter("panel", null);
            updateQueryStringParameter("u", null);
            if (onclose) onclose();
        };
        
        this.stack = [];
        const elements = createSidebarShell(parent, headerTxt, this.onGlobalClose);
        this.viewport = elements.viewport;
        this.navBar = elements.navBar;
    }

    addTab(options) {
        const tabName = options.name || options.header.toLowerCase().replace(/\s+/g, '-');
        const tabObj = {
            ...options,
            header: options.header || "Realm",
            name: tabName,
            ...createChamberDOM(options, () => this.pop()) 
        };
        tabObj.actual = tabObj.scrollArea; 
        tabObj.open = () => this.push(tabObj);
        
        tabObj.onUpdateHeader = (txt) => {
            tabObj.subTitle.innerText = txt;
            tabObj.header = txt;
            this.updateCrumbs();
        };
        
        if (typeof options.oninit === "function") options.oninit(tabObj);
        return tabObj;
    }

    // HELPER: Enforce Back Button State
    enforceBackBtnState(tabObj) {
        if(!tabObj || !tabObj.backBtn) return;
        // B"H - ABSOLUTE TRUTH: Only show back if depth > 1
        if (this.stack.length > 1) {
            tabObj.backBtn.style.setProperty("display", "flex", "important");
        } else {
            tabObj.backBtn.style.setProperty("display", "none", "important");
        }
    }

    syncUrl(tabObj) {
        if (!tabObj) {
            updateQueryStringParameter("panel", null);
            updateQueryStringParameter("u", null);
            return;
        }
        updateQueryStringParameter("panel", tabObj.name);
        if (tabObj.awtsmoosType === "specific alias comments" && window.currentAliasBeingViewed) {
            updateQueryStringParameter("u", window.currentAliasBeingViewed);
        } else {
            updateQueryStringParameter("u", null);
        }
    }

    updateCrumbs() {
        renderBreadcrumbs(this.navBar, this.stack, (index) => {
            while (this.stack.length - 1 > index) this.pop(true);
        });
    }

    async push(tabObj) {
        if (this.stack.includes(tabObj)) {
            const idx = this.stack.indexOf(tabObj);
            while (this.stack.length - 1 > idx) await this.pop(true);
            return;
        }
        const current = this.stack[this.stack.length - 1];
        this.stack.push(tabObj);
        
        this.enforceBackBtnState(tabObj); // ENFORCE STATE
        
        slideIn(tabObj, current, this.viewport);
        this.updateCrumbs();
        this.syncUrl(tabObj);
        
        if (tabObj.onopen) await tabObj.onopen({ tab: tabObj, actualTab: tabObj.actual });
    }

    async pop(isInternalJump = false) {
        if (this.stack.length <= 1 && !isInternalJump) return;
        const leaving = this.stack.pop();
        const returning = this.stack[this.stack.length - 1];
        
        if (leaving?.onclose) await leaving.onclose();
        
        slideOut(leaving, returning, this.viewport);
        
        if (returning) {
            this.enforceBackBtnState(returning); // ENFORCE STATE ON RETURN
            this.syncUrl(returning);
        }

        this.updateCrumbs();
    }

    getCurrent() { return this.stack[this.stack.length - 1]; }
    getTabs() { return this.stack; }
}