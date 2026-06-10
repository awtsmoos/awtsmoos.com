// B"H
(function membersBrowser(root) {
  const tables = root.AwtsEctIdTables = root.AwtsEctIdTables || {};
  tables.members = tables.members || {};

  /** B"H. Browser host member families: DOM, events, storage, network, observers. */
  Object.assign(tables.members, {
    document: ["getElementById", "querySelector", "querySelectorAll", "getElementsByClassName", "getElementsByTagName", "createElement", "createElementNS", "createTextNode", "createDocumentFragment", "importNode", "adoptNode", "addEventListener", "removeEventListener", "dispatchEvent", "body", "head", "documentElement", "title", "readyState", "currentScript", "cookie", "forms", "images", "links", "scripts", "styleSheets", "visibilityState", "hidden"],
    window: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "queueMicrotask", "addEventListener", "removeEventListener", "dispatchEvent", "innerWidth", "innerHeight", "outerWidth", "outerHeight", "devicePixelRatio", "scrollX", "scrollY", "pageXOffset", "pageYOffset", "scrollTo", "scrollBy", "open", "close", "matchMedia", "getComputedStyle", "alert", "confirm", "prompt", "focus", "blur", "postMessage"],
    navigator: ["userAgent", "language", "languages", "platform", "onLine", "cookieEnabled", "hardwareConcurrency", "deviceMemory", "maxTouchPoints", "clipboard", "geolocation", "serviceWorker", "storage", "permissions", "mediaDevices", "sendBeacon", "vibrate"],
    location: ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "origin", "assign", "replace", "reload"],
    history: ["length", "state", "back", "forward", "go", "pushState", "replaceState"],
    storage: ["length", "key", "getItem", "setItem", "removeItem", "clear"],
    element: ["id", "className", "classList", "style", "dataset", "textContent", "innerHTML", "outerHTML", "value", "checked", "disabled", "selected", "name", "type", "src", "href", "width", "height", "children", "childNodes", "parentNode", "parentElement", "firstChild", "lastChild", "nextSibling", "previousSibling", "appendChild", "prepend", "append", "before", "after", "remove", "removeChild", "replaceChild", "replaceChildren", "cloneNode", "contains", "matches", "closest", "setAttribute", "getAttribute", "removeAttribute", "hasAttribute", "toggleAttribute", "addEventListener", "removeEventListener", "dispatchEvent", "querySelector", "querySelectorAll", "getBoundingClientRect", "scrollIntoView", "focus", "blur", "click", "getContext", "animate", "insertAdjacentHTML", "insertAdjacentElement", "insertAdjacentText"],
    classList: ["add", "remove", "toggle", "contains", "replace", "value", "length", "item", "forEach"],
    style: ["cssText", "setProperty", "getPropertyValue", "removeProperty", "transform", "translate", "rotate", "scale", "opacity", "display", "visibility", "position", "background", "backgroundColor", "color", "width", "height", "left", "top", "right", "bottom", "padding", "margin", "border", "borderRadius", "boxShadow", "fontSize", "fontWeight", "lineHeight", "fillStyle", "strokeStyle"],
    event: ["type", "target", "currentTarget", "srcElement", "bubbles", "cancelable", "defaultPrevented", "timeStamp", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "offsetX", "offsetY", "movementX", "movementY", "key", "code", "altKey", "ctrlKey", "shiftKey", "metaKey", "button", "buttons", "pointerId", "pointerType", "isPrimary", "preventDefault", "stopPropagation", "stopImmediatePropagation"],
    rect: ["left", "top", "right", "bottom", "width", "height", "x", "y", "toJSON"],
    fetch: ["then", "catch", "finally"],
    Response: ["ok", "status", "statusText", "headers", "url", "redirected", "type", "clone", "text", "json", "blob", "arrayBuffer", "formData"],
    Headers: ["append", "delete", "get", "has", "set", "forEach", "keys", "values", "entries"],
    URLSearchParams: ["append", "delete", "get", "getAll", "has", "set", "sort", "toString", "keys", "values", "entries", "forEach"],
    AbortController: ["signal", "abort"],
    MutationObserver: ["observe", "disconnect", "takeRecords"],
    ResizeObserver: ["observe", "unobserve", "disconnect"],
    IntersectionObserver: ["observe", "unobserve", "disconnect", "takeRecords", "root", "rootMargin", "thresholds"],
    crypto: ["randomUUID", "getRandomValues", "subtle"],
    performance: ["now", "mark", "measure", "clearMarks", "clearMeasures", "getEntries", "getEntriesByName", "getEntriesByType", "timeOrigin", "memory"],
    CSS: ["supports", "escape", "px", "percent", "number", "deg", "em", "rem", "vh", "vw"]
  });
})(typeof self !== "undefined" ? self : globalThis);
