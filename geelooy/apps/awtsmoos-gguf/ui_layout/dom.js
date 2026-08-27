
// B"H
export function el(tag, className = "", content = "", attrs = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    
    if (content !== null && content !== undefined) {
        if (typeof content === 'string' || typeof content === 'number') {
            // Primitive content
            if (typeof content === 'string' && (content.includes('<') || content.includes('&'))) {
                 element.innerHTML = content;
            } else {
                 element.innerText = content;
            }
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (child) {
                    if (typeof child === 'string') {
                        // B"H - Correctly parse HTML strings into elements
                        const temp = document.createElement('div');
                        temp.innerHTML = child;
                        while(temp.firstChild) {
                            element.appendChild(temp.firstChild);
                        }
                    } else {
                        element.appendChild(child);
                    }
                }
            });
        }
    }

    for (const [key, value] of Object.entries(attrs)) {
        if (key.startsWith('on') && typeof value === 'function') {
            element[key.toLowerCase()] = value;
        } else if (key === 'style') {
            element.style.cssText = value;
        } else if (key === 'checked' || key === 'disabled') {
            if (value) element.setAttribute(key, '');
        } else {
            element.setAttribute(key, value);
        }
    }
    return element;
}

export function icon(pathData) {
    return `<svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1rem; height: 1rem;"><path stroke-linecap="round" stroke-linejoin="round" d="${pathData}" /></svg>`;
}