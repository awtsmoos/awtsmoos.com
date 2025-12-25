//B"H
/**
 * Awtsmoos Powered Tab Manager (Stack Navigation Edition)
 * Channeled to provide deep focus and clear hierarchy.
 * Navigates by sliding views (Push/Pop) rather than a horizontal strip.
 */ 
import { appendHTML } from "/heichelos/post/functions/utils.js"
import { makeDraggable, makeResizable, setupLayoutSyncer } from "./tabs/draggable.js";

class TabManager {
	constructor({
		parent, headerTxt = "Comments", onclose = ()=>{}
	}={}) {
		console.log("%c B\"H - TabManager (Stack) Constructor", "color: #ff5722; font-weight:bold;");
		if (!parent) return;

        this.sidebarElement = parent;
        this.stack = []; // The view stack
        this.baseHeaderTxt = headerTxt;
        this.onGlobalClose = onclose;
        
        // 1. Sidebar Container setup
        this.globalHeader = document.createElement("div");
        this.globalHeader.className = "awtsmoos-sidebar-header";
        
        // A. Header Top Row (Drag Handle)
        this.dragHandle = document.createElement("div");
        this.dragHandle.className = "awtsmoos-drag-handle";
        this.globalHeader.appendChild(this.dragHandle);

        // B. Navigation Row (Back | Title | Close)
        this.navRow = document.createElement("div");
        this.navRow.className = "awtsmoos-nav-row";
        this.globalHeader.appendChild(this.navRow);

        // Back Button
        this.backBtn = document.createElement("button");
        this.backBtn.className = "awtsmoos-nav-back hidden";
        this.backBtn.innerHTML = "&#8592;"; 
        this.backBtn.type = "button";
        this.backBtn.onpointerdown = (e) => e.stopPropagation(); // Prevent drag on button interaction
        this.backBtn.onclick = (e) => {
            e.stopPropagation();
            this.pop();
        };
        this.navRow.appendChild(this.backBtn);

        // Title
        this.titleEl = document.createElement("div");
        this.titleEl.className = "awtsmoos-nav-title";
        this.titleEl.innerText = headerTxt;
        this.navRow.appendChild(this.titleEl);

        // Close Sidebar Button (X)
        this.closeBtn = document.createElement("div");
        this.closeBtn.className = "awtsmoos-close-sidebar-btn";
        this.closeBtn.innerHTML = "&times;";
        this.closeBtn.title = "Close Sidebar";
        this.closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.sidebarElement.classList.add('hidden-comments');
            const btn = document.getElementById("commentaryBtn");
            if(btn) btn.classList.remove("pushed");
            if(this.onGlobalClose) this.onGlobalClose();
        };
        this.navRow.appendChild(this.closeBtn);
        
        parent.appendChild(this.globalHeader);
        
        // 2. The Viewport (Holds the sliding pages)
		this.tabHolder = document.createElement("div");
		this.tabHolder.classList.add("awtsmoos-tab-pane-container");
		parent.appendChild(this.tabHolder);

        // 3. Desktop Resizer (Left Edge)
        this.resizer = document.createElement("div");
        this.resizer.className = "awtsmoos-sidebar-resizer";
        parent.appendChild(this.resizer);
        
        // Initialize Draggable/Resizable with explicit sidebar reference
        makeDraggable({ 
            sidebar: this.sidebarElement, 
            headers: [this.globalHeader] 
        });
        
        makeResizable({ 
            sidebar: this.sidebarElement, 
            target: this.resizer 
        });

        // Hardened Syncer: Resets height/width when switching screen modes
        setupLayoutSyncer(this.sidebarElement);
	}
	
    /**
     * Pushes a new view onto the stack.
     */
	addTab({
		header, content, append, addClasses = false, 
		onopen, onclose, oninit
	}) {
        const view = document.createElement("div");
        view.className = "awtsmoos-individual-tab next-page"; 
        
        const info = document.createElement("div");
        info.className = "post-info";
        view.appendChild(info);

        const actualTab = document.createElement("div");
        actualTab.className = "tab-content";
        info.appendChild(actualTab);

        if (content) appendHTML(content, actualTab);
        if (typeof append === "function") append(actualTab);

        const tabObj = {
            dom: view,
            actual: actualTab,
            header: header,
            onopen,
            onclose,
            
            awtsRefresh: () => {
                actualTab.innerHTML = "";
                if(typeof onopen === "function") onopen({ tab: tabObj, actualTab });
            },
            onUpdateHeader: (txt) => {
                tabObj.header = txt;
                if(this.getCurrent() === tabObj) {
                    this.titleEl.innerText = txt;
                }
            },
            open: () => { 
                if(this.stack.length === 0 || this.getCurrent() !== tabObj) {
                    this.push(tabObj);
                }
            }
        };

        if (typeof oninit === "function") oninit(tabObj);
        return tabObj;
	}

    /**
     * Navigate deeper.
     */
    async push(tabObj) {
        const current = this.getCurrent();
        
        this.stack.push(tabObj);
        this.tabHolder.appendChild(tabObj.dom);
        
        this.titleEl.innerText = tabObj.header;
        this.updateBackButton();

        void tabObj.dom.offsetWidth;

        if (current) {
            current.dom.classList.add("slide-out-left");
            current.dom.classList.remove("active");
            
            tabObj.dom.classList.remove("next-page");
            tabObj.dom.classList.add("active", "slide-in-right");
            
            setTimeout(() => {
                current.dom.classList.add("hidden-view"); 
                current.dom.classList.remove("slide-out-left");
                tabObj.dom.classList.remove("slide-in-right");
            }, 300);
        } else {
            tabObj.dom.classList.remove("next-page");
            tabObj.dom.classList.add("active");
        }

        if (tabObj.onopen) {
            await tabObj.onopen({ tab: tabObj, actualTab: tabObj.actual });
        }
    }

    /**
     * Navigate back.
     */
    async pop() {
        if (this.stack.length <= 1) return; 

        const leavingTab = this.stack.pop();
        const incomingTab = this.getCurrent();

        this.titleEl.innerText = incomingTab.header || this.baseHeaderTxt;
        this.updateBackButton();

        incomingTab.dom.classList.remove("hidden-view");
        
        leavingTab.dom.classList.add("slide-out-right");
        leavingTab.dom.classList.remove("active");

        incomingTab.dom.classList.add("active", "slide-in-left");
        
        setTimeout(() => {
            leavingTab.dom.remove(); 
            incomingTab.dom.classList.remove("slide-in-left");
        }, 300);

        if (leavingTab.onclose) {
            await leavingTab.onclose();
        }
    }

    getCurrent() {
        return this.stack[this.stack.length - 1];
    }
    
    getTabs() {
        return this.stack;
    }

    updateBackButton() {
        if (this.stack.length > 1) {
            this.backBtn.classList.remove("hidden");
        } else {
            this.backBtn.classList.add("hidden");
        }
    }
}

export default TabManager;