// B"H
/**
 * @module SidebarShell
 * @description
 * Chapter 109: One crown, one trail.
 * The Awtsmoos gives the sidebar a single current title. The breadcrumb trail
 * is secondary and clickable; it no longer competes as duplicate page headers.
 */

import { makeResizable, setupLayoutSyncer } from "../draggable.js";
import { toggleSidebar } from "../../logic/listeners.js";

function button(className, text, title, onClick) {
    const node = document.createElement("button");
    node.className = className;
    node.type = "button";
    node.title = title;
    node.innerHTML = text;
    node.onclick = event => {
        event.stopPropagation();
        onClick?.(event, node);
    };
    return node;
}

export function createSidebarShell(parent, headerTxt, onGlobalClose) {
    console.log("B\"H - [Shell] Manifesting the polished gates of the Sidebar.");
    const shell = document.createElement("div");
    shell.className = "awtsmoos-sidebar-shell";

    const resizer = document.createElement("div");
    resizer.className = "awtsmoos-sidebar-resizer";
    parent.appendChild(resizer);

    const headerChrome = document.createElement("div");
    headerChrome.className = "awtsmoos-sidebar-header-chrome";

    const chromeRow = document.createElement("div");
    chromeRow.className = "awtsmoos-chrome-row";

    const titleButton = document.createElement("button");
    titleButton.className = "awtsmoos-current-view-title";
    titleButton.type = "button";
    titleButton.textContent = headerTxt;
    titleButton.title = "Return to the previous chamber";

    const controls = document.createElement("div");
    controls.className = "awtsmoos-chrome-controls";

    const fullScreenBtn = button("awtsmoos-chrome-btn", "⛶", "Toggle Fullscreen", () => {
        parent.classList.toggle("fullscreen-mode");
        fullScreenBtn.innerHTML = parent.classList.contains("fullscreen-mode") ? "□" : "⛶";
    });

    const closeBtn = button("awtsmoos-chrome-btn close", "×", "Close Divine Context", () => {
        parent.classList.remove("fullscreen-mode");
        fullScreenBtn.innerHTML = "⛶";
        toggleSidebar(false);
        onGlobalClose?.();
    });

    controls.append(fullScreenBtn, closeBtn);
    chromeRow.append(titleButton, controls);
    headerChrome.appendChild(chromeRow);

    const navBar = document.createElement("div");
    navBar.className = "awtsmoos-sidebar-breadcrumbs";
    headerChrome.appendChild(navBar);

    const viewport = document.createElement("div");
    viewport.className = "awtsmoos-slide-viewport";

    shell.append(headerChrome, viewport);
    parent.appendChild(shell);

    makeResizable({ sidebar: parent, target: resizer });
    setupLayoutSyncer(parent);
    return { viewport, navBar, titleEl: titleButton };
}
