// B"H
/**
 * @module SidebarBreadcrumbsManager
 * @description
 * Chapter 110: The trail becomes quiet and useful.
 * Only parent chambers appear as chips. The current chamber lives in the single
 * crown title, preventing duplicate active headers.
 */

export function renderBreadcrumbs(container, stack, onNavigate) {
    if (!container) return;
    container.innerHTML = "";
    const parents = stack.slice(0, -1);
    if (!parents.length) {
        container.classList.add("is-empty");
        return;
    }
    container.classList.remove("is-empty");
    parents.forEach((tab, index) => {
        const crumb = document.createElement("button");
        crumb.className = "awtsmoos-crumb-link";
        crumb.type = "button";
        crumb.innerHTML = `<span>${tab.header}</span><span class="crumb-arrow">›</span>`;
        crumb.onclick = event => {
            event.stopPropagation();
            onNavigate(index);
        };
        container.appendChild(crumb);
    });
}
