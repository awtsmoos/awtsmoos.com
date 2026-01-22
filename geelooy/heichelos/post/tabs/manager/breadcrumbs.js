//B"H
/**
 * @method renderBreadcrumbs
 * @description 
 * Weaving the trail of light through the spheres.
 * It reconstructs the seeker's journey from the current stack depth.
 */
export function renderBreadcrumbs(container, stack, onNavigate) {
    if (!container) return;
    console.log("B\"H - [Breadcrumbs] Re-weaving the trail of light.");
    container.innerHTML = "";
    
    stack.forEach((tab, i) => {
        const crumb = document.createElement("button");
        crumb.className = "awtsmoos-crumb-link";
        
        const txt = document.createElement("span");
        txt.innerText = tab.header;
        crumb.appendChild(txt);

        if (i < stack.length - 1) {
            // A parent crumb allows navigation back to that sphere
            crumb.onclick = (e) => {
                e.stopPropagation();
                console.log(`B"H - [Breadcrumbs] Jump to level ${i}: ${tab.header}.`);
                onNavigate(i);
            };
            const arrow = document.createElement("span");
            arrow.className = "crumb-arrow";
            arrow.innerText = "›";
            crumb.appendChild(arrow);
        } else {
            // The active sphere is centered and unclickable
            crumb.classList.add("active-crumb");
            crumb.disabled = true;
        }
        
        container.appendChild(crumb);
    });
}