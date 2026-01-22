//B"H
import { makeResizable, setupLayoutSyncer } from "../draggable.js";
import { toggleSidebar } from "../../logic/listeners.js";

/**
 * @method createSidebarShell
 * @description 
 * Manifests the iron gates and the crown of the Sidebar.
 * Like the boundary between worlds, it defines where the light is contained.
 */
export function createSidebarShell(parent, headerTxt, onGlobalClose) {
    console.log("B\"H - [Shell] Manifesting the iron gates of the Sidebar.");
    
    const shell = document.createElement("div");
    shell.className = "awtsmoos-sidebar-shell";
    
    // Resizer: The touchpoint between the seeker and the expanse
    const resizer = document.createElement("div");
    resizer.className = "awtsmoos-sidebar-resizer";
    parent.appendChild(resizer);

    // Chrome Header: The crown of the sidebar
    const headerChrome = document.createElement("div");
    headerChrome.className = "awtsmoos-sidebar-header-chrome";
    
    const chromeRow = document.createElement("div");
    chromeRow.className = "awtsmoos-chrome-row";
    chromeRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";

    const titleEl = document.createElement("h3");
    titleEl.className = "awtsmoos-current-view-title";
    titleEl.innerText = headerTxt;

    const closeBtn = document.createElement("button");
    closeBtn.className = "awtsmoos-chrome-close";
    closeBtn.innerHTML = "×";
    closeBtn.title = "Close the Sidebar Gate";
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        console.log("B\"H - [Shell] Command received: Collapsing the expanse.");
        toggleSidebar(false);
        if(onGlobalClose) onGlobalClose();
    };

    chromeRow.append(titleEl, closeBtn);
    headerChrome.appendChild(chromeRow);

    // Breadcrumbs: The tiny stars that mark the path
    const navBar = document.createElement("div");
    navBar.className = "awtsmoos-sidebar-breadcrumbs";
    headerChrome.appendChild(navBar);

    shell.appendChild(headerChrome);

    // Viewport: The stage where the manifest worlds appear
    const viewport = document.createElement("div");
    viewport.className = "awtsmoos-slide-viewport";
    shell.appendChild(viewport);

    parent.appendChild(shell);

    // Physics ignition
    console.log("B\"H - [Shell] Igniting resizing physics.");
    makeResizable({ sidebar: parent, target: resizer });
    setupLayoutSyncer(parent);

    return { viewport, navBar };
}