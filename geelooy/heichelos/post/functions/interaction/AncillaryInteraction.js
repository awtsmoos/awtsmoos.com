
/**
 * B"H
 * @module AncillaryInteraction
 * @chapter Hidden Gates and Subsurface Insights
 * @description
 * This module manages the ancillary gateways of the text. 
 * Like the marginal notes of the ancient Scribes, these 'Footnotes' 
 * and 'Dropdowns' reveal hidden depth within the primary speech 
 * of the post. 
 */

/**
 * @function weaveDropdownFromAwtsmoos
 * @description
 * Creates a floating menu of options for a specific element.
 * 
 * @param {HTMLElement} element - The anchor of the menu.
 * @param {Object} actions - A map of ritual names to functions.
 */
export async function weaveDropdownFromAwtsmoos(element, actions) {
    let menu = element.querySelector('.ohr-ein-sof-dropdown');
    if (menu) { 
        menu.classList.toggle('ohr-ein-sof-revealed'); 
        return; 
    }
    
    menu = document.createElement('div');
    menu.classList.add('ohr-ein-sof-dropdown');
    element.appendChild(menu);
    
    Object.entries(actions).forEach(([name, ritual]) => {
        const item = document.createElement("div");
        item.classList.add('atzilus-menu-item');
        item.textContent = name;
        item.onclick = async (e) => {
            e.stopPropagation();
            await ritual(e);
            menu.classList.remove('ohr-ein-sof-revealed');
        };
        menu.appendChild(item);
    });
    
    // Timing ensure the Kav can reach the browser
    requestAnimationFrame(() => menu.classList.add('ohr-ein-sof-revealed'));
}
