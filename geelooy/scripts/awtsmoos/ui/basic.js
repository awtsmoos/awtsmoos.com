//B"H
function createElement({ tag, html, attributes, children }) {
    const element = document.createElement(tag);
    if (html) element.innerHTML = html;
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === "onclick" && typeof value === "function") {
                element.onclick = value;
            } else {
                element.setAttribute(key, value);
            }
        });
    }
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === "object" && child !== null) {
                element.appendChild(createElement(child));
            } else if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            }
        });
    }
    return element;
}

function appendElements(parent, elements) {
    elements.forEach(element => parent.appendChild(element));
}

export {
    appendElements,
    createElement
}