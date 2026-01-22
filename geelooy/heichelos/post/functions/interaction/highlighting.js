// /BH/awtsmoos.com/geelooy/heichelos/post/functions/interaction/highlighting.js
//B"H
/**
 * @file highlighting.js
 * The Watcher of the Text.
 */
import Highlighter from "/api/nav/highlighter.js";
import { updateQueryStringParameter } from "../utils.js";

export function startHighlighting(elId, targetClass, callback, desCallback) {
    console.log("B\"H - [Interaction] Engaging High-Intensity Watchers.");
    const containerSelector = "#" + elId;
    
    // Watcher Level 1: THE VERSES (.section)
    const verseChai = new Highlighter(
        containerSelector,
        "." + targetClass,
        (h) => { 
            if (typeof callback === 'function') callback({ main: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                if (typeof desCallback === 'function') desCallback();
            }
        }
    );

    // Watcher Level 2: THE PARAGRAPHS (.sub-awtsmoos)
    const subChai = new Highlighter(
        containerSelector,
        "." + targetClass + " .sub-awtsmoos",
        (h) => { 
            if (typeof callback === 'function') callback({ sub: h }); 
        },
        {
            deselectEnabled: true,
            onDeselectCallback: () => {
                updateQueryStringParameter("sub", null);
                window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { sub: null } }));
            }
        }
    );

    window.chai = verseChai;
    window.subChai = subChai;
}

export async function weaveDropdownFromAwtsmoos(element, actions) {
    let menu = element.querySelector('.ohr-ein-sof-dropdown');
    if (menu) { 
        menu.classList.toggle('ohr-ein-sof-revealed'); 
        return; 
    }
    
    menu = document.createElement('div');
    menu.classList.add('ohr-ein-sof-dropdown');
    element.appendChild(menu);
    
    Object.keys(actions).forEach(k => {
        const item = document.createElement("div");
        item.classList.add('atzilus-menu-item');
        item.textContent = k;
        item.onclick = async (e) => {
            e.stopPropagation();
            await actions[k](e);
            menu.classList.remove('ohr-ein-sof-revealed');
        };
        menu.appendChild(item);
    });
    
    requestAnimationFrame(() => menu.classList.add('ohr-ein-sof-revealed'));
}