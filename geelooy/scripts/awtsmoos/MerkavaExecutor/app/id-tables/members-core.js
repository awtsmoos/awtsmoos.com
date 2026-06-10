// B"H
(function membersCore(root) {
  const tables = root.AwtsEctIdTables = root.AwtsEctIdTables || {};
  tables.members = tables.members || {};

  /** B"H. Core JavaScript built-in member families. */
  Object.assign(tables.members, {
    Object: ["keys", "values", "entries", "assign", "create", "defineProperty", "defineProperties", "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols", "freeze", "seal", "preventExtensions", "is", "isFrozen", "isSealed", "isExtensible", "getPrototypeOf", "setPrototypeOf", "hasOwn", "hasOwnProperty", "propertyIsEnumerable", "toString", "valueOf"],
    Array: ["from", "isArray", "of", "length", "at", "push", "pop", "shift", "unshift", "splice", "slice", "map", "filter", "reduce", "reduceRight", "forEach", "find", "findIndex", "findLast", "findLastIndex", "includes", "indexOf", "lastIndexOf", "join", "sort", "toSorted", "reverse", "toReversed", "flat", "flatMap", "some", "every", "fill", "copyWithin", "keys", "values", "entries"],
    String: ["fromCharCode", "fromCodePoint", "raw", "length", "at", "charAt", "charCodeAt", "codePointAt", "includes", "indexOf", "lastIndexOf", "slice", "substring", "substr", "split", "trim", "trimStart", "trimEnd", "toLowerCase", "toUpperCase", "toLocaleLowerCase", "toLocaleUpperCase", "replace", "replaceAll", "match", "matchAll", "search", "startsWith", "endsWith", "padStart", "padEnd", "repeat", "normalize", "localeCompare"],
    Number: ["EPSILON", "MAX_SAFE_INTEGER", "MIN_SAFE_INTEGER", "MAX_VALUE", "MIN_VALUE", "NaN", "NEGATIVE_INFINITY", "POSITIVE_INFINITY", "isFinite", "isInteger", "isNaN", "isSafeInteger", "parseFloat", "parseInt", "toFixed", "toExponential", "toPrecision", "toString", "valueOf"],
    Math: ["PI", "E", "LN2", "LN10", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2", "abs", "sign", "min", "max", "floor", "ceil", "round", "trunc", "random", "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "sinh", "cosh", "tanh", "sqrt", "cbrt", "pow", "hypot", "log", "log2", "log10", "log1p", "exp", "expm1", "clz32", "imul", "fround"],
    JSON: ["parse", "stringify"],
    Promise: ["resolve", "reject", "all", "allSettled", "race", "any", "withResolvers", "then", "catch", "finally"],
    Map: ["get", "set", "has", "delete", "clear", "keys", "values", "entries", "forEach", "size"],
    Set: ["add", "has", "delete", "clear", "keys", "values", "entries", "forEach", "size", "union", "intersection", "difference", "symmetricDifference", "isSubsetOf", "isSupersetOf", "isDisjointFrom"],
    Date: ["now", "parse", "UTC", "getTime", "getFullYear", "getMonth", "getDate", "getDay", "getHours", "getMinutes", "getSeconds", "getMilliseconds", "toISOString", "toJSON", "toLocaleString", "setTime", "setFullYear", "setMonth", "setDate"],
    RegExp: ["test", "exec", "source", "flags", "global", "ignoreCase", "multiline", "dotAll", "unicode", "sticky"],
    console: ["log", "warn", "error", "info", "debug", "table", "dir", "time", "timeEnd", "timeLog", "trace", "clear", "group", "groupEnd", "assert", "count", "countReset"],
    Reflect: ["apply", "construct", "defineProperty", "deleteProperty", "get", "getOwnPropertyDescriptor", "getPrototypeOf", "has", "isExtensible", "ownKeys", "preventExtensions", "set", "setPrototypeOf"],
    Intl: ["DateTimeFormat", "NumberFormat", "Collator", "PluralRules", "RelativeTimeFormat", "ListFormat", "Segmenter", "Locale"],
    Atomics: ["add", "and", "compareExchange", "exchange", "load", "or", "store", "sub", "wait", "waitAsync", "notify", "xor"],
    WebAssembly: ["compile", "compileStreaming", "instantiate", "instantiateStreaming", "validate", "Module", "Instance", "Memory", "Table", "Global"]
  });
})(typeof self !== "undefined" ? self : globalThis);
