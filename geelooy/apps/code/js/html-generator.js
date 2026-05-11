// B"H
/**
 * @file html-generator.js
 * @brief THE GENESIS ENGINE OF DOM MANIFESTATION.
 * 
 * THE TRACTATE OF THE JSON CLAY:
 * In the realm of Asiyah (Action), elements are physical objects built from nothing.
 * If we carve them using messy strings (innerHTML concatenation), we introduce Tohu (Chaos), 
 * where rogue syntax characters (like stray $ or >) can shatter the entire DOM hierarchy.
 * By defining the structural reality as a pure JavaScript Object (JSON representation),
 * we establish Seder (Order). 
 * 
 * This Divine Engine interprets the abstract blueprint:
 * 1. Tag (The Guf / Body)
 * 2. Attributes (The Seals)
 * 3. Styles (The Levushim / Garments)
 * 4. Children (The Seder Hishtalshelus / Descent of subsequent forms)
 * 
 * Even the mysterious SVG namespace is handled properly here, ensuring that graphics 
 * created through the Awtsmoos' Will display flawlessly.
 */

/**
 * B"H - Transforms an abstract JSON intent into a living, breathing HTMLElement.
 * 
 * @param {Object|String|Number|Node} blueprint - The conceptual seed of the element.
 * @returns {HTMLElement|Text|SVGElement} The physical structure rendered upon the screen.
 */
export const HTML = (blueprint) => {
    // 1. Handle Nullity (Ayin)
    if (blueprint === null || blueprint === undefined) {
        return document.createTextNode('');
    }
    
    // 2. Handle Simple Utterances (Primitives)
    if (typeof blueprint === 'string' || typeof blueprint === 'number') {
        return document.createTextNode(String(blueprint));
    }

    // 3. Handle Already Manifested Forms
    if (blueprint instanceof Node) {
        return blueprint;
    }

    // 4. Manifest the Vessel (Create Element)
    const tag = blueprint.tag || 'div';
    const isSvg =['svg', 'path', 'use', 'g', 'circle', 'rect', 'line'].includes(tag.toLowerCase());
    
    const element = isSvg 
        ? document.createElementNS('http://www.w3.org/2000/svg', tag) 
        : document.createElement(tag);

    // 5. Apply the Lights and Garments (Iterate Blueprint Properties)
    for (const [key, val] of Object.entries(blueprint)) {
        // Skip structural processing keys
        if (['tag', 'children', 'ref'].includes(key) || val === null || val === undefined) continue;

        // Apply Styles Object
        if (key === 'style' && typeof val === 'object') {
            Object.assign(element.style, val);
        } 
        // Bounding the data intent
        else if (key === 'dataset' && typeof val === 'object') {
            for (const[dataKey, dataVal] of Object.entries(val)) {
                if (dataVal !== null && dataVal !== undefined) {
                    element.dataset[dataKey] = dataVal;
                }
            }
        } 
        // Bestow Identifiers and Classes
        else if (key === 'className' || key === 'class') {
            if (isSvg) element.setAttribute('class', String(val));
            else element.className = String(val);
        } 
        else if (key === 'id') {
            element.id = String(val);
        }
        // Direct Attributes application (Crucial for ARIA, viewBox, etc)
        else if (key === 'attributes' || key === 'attrs') {
            for (const [attr, attrVal] of Object.entries(val)) {
                if (attrVal !== null && attrVal !== undefined) {
                    // Specific check for svg href
                    if (attr === 'href' && tag.toLowerCase() === 'use') {
                        element.setAttributeNS('http://www.w3.org/1999/xlink', attr, String(attrVal));
                    } else {
                        element.setAttribute(attr, String(attrVal));
                    }
                }
            }
        } 
        // Inner String Content
        else if (key === 'html') {
            element.innerHTML = String(val);
        } 
        else if (key === 'text') {
            element.textContent = String(val);
        } 
        // Direct Event Listening Object
        else if (key === 'events' && typeof val === 'object') {
            for (const [type, fn] of Object.entries(val)) {
                if (typeof fn === 'function') element.addEventListener(type, fn);
            }
        } 
        // Functional On-[Event] Binding
        else if (key.startsWith('on') && typeof val === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, val);
        } 
        // General property assignment fallback
        else {
            try {
                if (isSvg) {
                    element.setAttribute(key, String(val));
                } else {
                    element[key] = val;
                }
            } catch(e) {
                // Read-only safety guard
                element.setAttribute(key, String(val));
            }
        }
    }

    // 6. Channel the Seder Hishtalshelus (Descend to Children)
    if (Array.isArray(blueprint.children)) {
        blueprint.children.forEach(childBlueprint => {
            if (childBlueprint) {
                const childElement = HTML(childBlueprint);
                if (childElement) element.appendChild(childElement);
            }
        });
    }

    // 7. Invoke the Reference Observer (Allows parent scripts to bind physical references immediately)
    if (typeof blueprint.ref === 'function') {
        blueprint.ref(element);
    }

    return element;
};