// B"H
(function rootsTable(root) {
  const tables = root.AwtsEctIdTables = root.AwtsEctIdTables || {};

  /**
   * B"H. Root vessels: every global constructor, host singleton, typed-array
   * shrine, browser service, and elemental JavaScript authority receives an ID
   * before user code arrives. A root name should almost never fall into custom
   * pools unless the runtime itself is exotic.
   */
  tables.roots = [
    "globalThis", "window", "self", "document", "navigator", "location", "history", "screen",
    "console", "Math", "JSON", "Object", "Array", "String", "Number", "Boolean", "BigInt",
    "Date", "RegExp", "Promise", "Map", "Set", "WeakMap", "WeakSet", "Symbol", "Reflect",
    "Proxy", "Error", "TypeError", "RangeError", "SyntaxError", "ReferenceError", "URIError",
    "EvalError", "AggregateError", "Intl", "Atomics", "WebAssembly", "Event", "CustomEvent",
    "EventTarget", "Node", "Text", "Comment", "DocumentFragment", "Element", "HTMLElement",
    "HTMLDivElement", "HTMLButtonElement", "HTMLInputElement", "HTMLCanvasElement", "HTMLImageElement",
    "HTMLVideoElement", "HTMLAudioElement", "CanvasRenderingContext2D", "ImageData", "Path2D",
    "WebGLRenderingContext", "WebGL2RenderingContext", "URL", "URLSearchParams", "Blob", "File",
    "FileReader", "FormData", "Headers", "Request", "Response", "ReadableStream", "WritableStream",
    "TransformStream", "AbortController", "AbortSignal", "crypto", "Crypto", "SubtleCrypto",
    "performance", "PerformanceObserver", "localStorage", "sessionStorage", "indexedDB", "caches",
    "fetch", "Worker", "SharedWorker", "MessageChannel", "BroadcastChannel", "MutationObserver",
    "ResizeObserver", "IntersectionObserver", "setTimeout", "clearTimeout", "setInterval",
    "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "queueMicrotask", "structuredClone",
    "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURI", "decodeURI", "encodeURIComponent",
    "decodeURIComponent", "btoa", "atob", "CSS", "CSSStyleSheet", "DOMParser", "XMLSerializer"
  ];
})(typeof self !== "undefined" ? self : globalThis);
