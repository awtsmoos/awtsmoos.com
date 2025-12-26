//B"H
/**
 * Awtsmoos Powered Tab Manager (Stack Navigation Edition)
 * Refined for high-intensity localization and sliding transitions.
 */ 
import { appendHTML } from "/heichelos/post/functions/utils.js"
import { makeDraggable, makeResizable, setupLayoutSyncer } from "./tabs/draggable.js";

class TabManager {
	constructor({
		parent, headerTxt = "Insights", onclose = ()=>{}
	}={}) {
		if (!parent) return;

        this.sidebarElement = parent;
        this.stack = []; 
        this.baseHeaderTxt = headerTxt;
        this.onGlobalClose = onclose;
        
        parent.style.display = "flex";
        parent.style.flexDirection = "column";

        // 1. Sidebar Header (Anchored)
        this.globalHeader = document.createElement("div");
        this.globalHeader.className = "awtsmoos-sidebar-header";
        
        this.dragHandle = document.createElement("div");
        this.dragHandle.className = "awtsmoos-drag-handle";
        this.globalHeader.appendChild(this.dragHandle);

        // Persistent Breadcrumb Trail
        this.breadcrumbTrail = document.createElement("div");
        this.breadcrumbTrail.className = "awtsmoos-breadcrumb-trail";
        this.globalHeader.appendChild(this.breadcrumbTrail);

        // Navigation Controls
        this.navRow = document.createElement("div");
        this.navRow.className = "awtsmoos-nav-row";
        this.globalHeader.appendChild(this.navRow);

        this.backBtn = document.createElement("button");
        this.backBtn.className = "awtsmoos-nav-back hidden";
        this.backBtn.innerHTML = "&#8592;"; 
        this.backBtn.onclick = () => this.pop();
        this.navRow.appendChild(this.backBtn);

        this.titleEl = document.createElement("div");
        this.titleEl.className = "awtsmoos-nav-title";
        this.titleEl.innerText = headerTxt;
        this.navRow.appendChild(this.titleEl);

        this.closeBtn = document.createElement("div");
        this.closeBtn.className = "awtsmoos-close-sidebar-btn";
        this.closeBtn.innerHTML = "&times;";
        this.closeBtn.onclick = () => {
            this.sidebarElement.classList.add('hidden-comments');
            const btn = document.getElementById("commentaryBtn");
            if(btn) btn.classList.remove("pushed");
            if(this.onGlobalClose) this.onGlobalClose();
        };
        this.navRow.appendChild(this.closeBtn);
        
        parent.appendChild(this.globalHeader);
        
        // 2. Viewport Area
		this.tabHolder = document.createElement("div");
		this.tabHolder.classList.add("awtsmoos-tab-pane-container");
		parent.appendChild(this.tabHolder);

        // 3. Desktop Resizer Handle
        this.resizer = document.createElement("div");
        this.resizer.className = "awtsmoos-sidebar-resizer";
        parent.appendChild(this.resizer);
        
        makeDraggable({ sidebar: this.sidebarElement, headers: [this.globalHeader] });
        makeResizable({ sidebar: this.sidebarElement, target: this.resizer });
        setupLayoutSyncer(this.sidebarElement);
	}
	
	addTab({
		header, content, append, onopen, onclose, oninit
	}) {
        const view = document.createElement("div");
        view.className = "awtsmoos-individual-tab next-page"; 
        
        const actualTab = document.createElement("div");
        actualTab.className = "tab-content-inner";
        view.appendChild(actualTab);

        if (content) appendHTML(content, actualTab);
        if (typeof append === "function") append(actualTab);

        const tabObj = {
            dom: view,
            actual: actualTab,
            header: header,
            onopen,
            onclose,
            open: () => { 
                if(this.stack.length === 0 || this.getCurrent() !== tabObj) {
                    this.push(tabObj);
                }
            }
        };

        if (typeof oninit === "function") oninit(tabObj);
        return tabObj;
	}

    async push(tabObj) {
        const current = this.getCurrent();
        this.stack.push(tabObj);
        this.tabHolder.appendChild(tabObj.dom);
        
        this.titleEl.innerText = tabObj.header;
        this.updateUI();

        void tabObj.dom.offsetWidth; // Trigger reflow for transition

        if (current) {
            current.dom.classList.add("slide-out-left");
            current.dom.classList.remove("active");
            
            tabObj.dom.classList.remove("next-page");
            tabObj.dom.classList.add("active");
        } else {
            tabObj.dom.classList.remove("next-page");
            tabObj.dom.classList.add("active");
        }

        if (tabObj.onopen) await tabObj.onopen({ tab: tabObj, actualTab: tabObj.actual });
    }

    async pop() {
        if (this.stack.length <= 1) return; 

        const leavingTab = this.stack.pop();
        const incomingTab = this.getCurrent();

        this.titleEl.innerText = incomingTab.header || this.baseHeaderTxt;
        this.updateUI();

        incomingTab.dom.classList.remove("slide-out-left");
        incomingTab.dom.classList.add("active");
        
        leavingTab.dom.classList.add("next-page");
        leavingTab.dom.classList.remove("active");

        setTimeout(() => leavingTab.dom.remove(), 500);

        if (leavingTab.onclose) await leavingTab.onclose();
    }

    /**
     * B"H - Pops the stack multiple times to reach a specific index.
     * Essential for interactive breadcrumbs.
     */
    async jumpTo(index) {
        const popsNeeded = (this.stack.length - 1) - index;
        if (popsNeeded <= 0) return;
        
        for (let i = 0; i < popsNeeded; i++) {
            await this.pop();
        }
    }

    getCurrent() { return this.stack[this.stack.length - 1]; }
    getTabs() { return this.stack; }

    updateUI() {
        this.backBtn.classList.toggle("hidden", this.stack.length <= 1);
        
        // Render Interactive Breadcrumb Path
        this.breadcrumbTrail.innerHTML = "";
        this.stack.forEach((t, i) => {
            const isLast = i === this.stack.length - 1;
            const span = document.createElement("span");
            span.innerText = t.header;
            if (isLast) {
                span.style.color = "#fff";
                span.style.fontWeight = "900";
            } else {
                span.onclick = () => this.jumpTo(i);
            }
            this.breadcrumbTrail.appendChild(span);
            
            if (!isLast) {
                const sep = document.createElement("span");
                sep.innerText = " > ";
                sep.style.opacity = "0.3";
                this.breadcrumbTrail.appendChild(sep);
            }
        });
    }
}

export default TabManager;