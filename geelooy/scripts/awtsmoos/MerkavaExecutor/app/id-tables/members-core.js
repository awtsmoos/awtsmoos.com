// B"H
(function membersCore(root) {
  const tables = root.AwtsEctIdTables = root.AwtsEctIdTables || {};
  tables.members = tables.members || {};

  /**
   * B"H. Core JavaScript member families.
   *
   * Standard engine vocabulary must descend as compact IDs, not custom strings:
   * collections, typed arrays, promises, errors, URLs, streams, CSSOM, and the
   * built-in constructors all receive broad generic member coverage.
   */
  const arrayMembers = "from isArray of fromAsync length at push pop shift unshift splice toSpliced slice map filter reduce reduceRight forEach find findIndex findLast findLastIndex includes indexOf lastIndexOf join sort toSorted reverse toReversed flat flatMap some every fill copyWithin keys values entries concat with group groupToMap toString toLocaleString".split(" ");
  const typedArrayMembers = "BYTES_PER_ELEMENT length byteLength byteOffset buffer at copyWithin entries every fill filter find findIndex findLast findLastIndex forEach includes indexOf join keys lastIndexOf map reduce reduceRight reverse set slice some sort subarray toLocaleString toReversed toSorted toString values with from of".split(" ");

  Object.assign(tables.members, {
    Object: "keys values entries assign create defineProperty defineProperties getOwnPropertyDescriptor getOwnPropertyDescriptors getOwnPropertyNames getOwnPropertySymbols freeze seal preventExtensions is isFrozen isSealed isExtensible getPrototypeOf setPrototypeOf hasOwn hasOwnProperty propertyIsEnumerable toString valueOf toLocaleString constructor __defineGetter__ __defineSetter__ __lookupGetter__ __lookupSetter__".split(" "),
    Array: arrayMembers,
    String: "fromCharCode fromCodePoint raw length at charAt charCodeAt codePointAt includes indexOf lastIndexOf slice substring substr split trim trimStart trimEnd trimLeft trimRight toLowerCase toUpperCase toLocaleLowerCase toLocaleUpperCase replace replaceAll match matchAll search startsWith endsWith padStart padEnd repeat normalize localeCompare concat anchor big blink bold fixed fontcolor fontsize italics link small strike sub sup isWellFormed toWellFormed".split(" "),
    Number: "EPSILON MAX_SAFE_INTEGER MIN_SAFE_INTEGER MAX_VALUE MIN_VALUE NaN NEGATIVE_INFINITY POSITIVE_INFINITY isFinite isInteger isNaN isSafeInteger parseFloat parseInt toFixed toExponential toPrecision toString valueOf toLocaleString".split(" "),
    BigInt: "asIntN asUintN toString valueOf toLocaleString".split(" "),
    Boolean: "toString valueOf".split(" "),
    Symbol: "asyncIterator hasInstance isConcatSpreadable iterator match matchAll replace search species split toPrimitive toStringTag unscopables for keyFor description toString valueOf".split(" "),
    Math: "PI E LN2 LN10 LOG2E LOG10E SQRT1_2 SQRT2 abs sign min max floor ceil round trunc random sin cos tan asin acos atan atan2 sinh cosh tanh asinh acosh atanh sqrt cbrt pow hypot log log2 log10 log1p exp expm1 clz32 imul fround".split(" "),
    JSON: "parse stringify rawJSON isRawJSON".split(" "),
    Promise: "resolve reject all allSettled race any withResolvers try then catch finally".split(" "),
    Map: "get set has delete clear keys values entries forEach size groupBy".split(" "),
    Set: "add has delete clear keys values entries forEach size union intersection difference symmetricDifference isSubsetOf isSupersetOf isDisjointFrom".split(" "),
    WeakMap: "get set has delete".split(" "),
    WeakSet: "add has delete".split(" "),
    WeakRef: "deref".split(" "),
    FinalizationRegistry: "register unregister".split(" "),
    Date: "now parse UTC getTime getFullYear getUTCFullYear getMonth getUTCMonth getDate getUTCDate getDay getUTCDay getHours getUTCHours getMinutes getUTCMinutes getSeconds getUTCSeconds getMilliseconds getUTCMilliseconds getTimezoneOffset toISOString toJSON toLocaleString toLocaleDateString toLocaleTimeString toDateString toTimeString toUTCString setTime setFullYear setUTCFullYear setMonth setUTCMonth setDate setUTCDate setHours setUTCHours setMinutes setUTCMinutes setSeconds setUTCSeconds setMilliseconds setUTCMilliseconds".split(" "),
    RegExp: "test exec compile source flags global ignoreCase multiline dotAll unicode unicodeSets sticky hasIndices lastIndex".split(" "),
    Error: "message name cause stack toString captureStackTrace isError".split(" "),
    TypeError: "message name cause stack toString".split(" "),
    RangeError: "message name cause stack toString".split(" "),
    SyntaxError: "message name cause stack toString".split(" "),
    ReferenceError: "message name cause stack toString".split(" "),
    URIError: "message name cause stack toString".split(" "),
    EvalError: "message name cause stack toString".split(" "),
    AggregateError: "errors message name cause stack toString".split(" "),
    console: "log warn error info debug table dir dirxml time timeEnd timeLog trace clear group groupCollapsed groupEnd assert count countReset profile profileEnd timeStamp".split(" "),
    Reflect: "apply construct defineProperty deleteProperty get getOwnPropertyDescriptor getPrototypeOf has isExtensible ownKeys preventExtensions set setPrototypeOf".split(" "),
    Proxy: "revocable".split(" "),
    Intl: "DateTimeFormat NumberFormat Collator PluralRules RelativeTimeFormat ListFormat Segmenter Locale DisplayNames DurationFormat supportedValuesOf".split(" "),
    Atomics: "add and compareExchange exchange load or store sub wait waitAsync notify xor isLockFree pause".split(" "),
    WebAssembly: "compile compileStreaming instantiate instantiateStreaming validate Module Instance Memory Table Global CompileError LinkError RuntimeError".split(" "),
    ArrayBuffer: "byteLength slice isView transfer transferToFixedLength detached resize maxByteLength resizable".split(" "),
    SharedArrayBuffer: "byteLength slice grow maxByteLength growable".split(" "),
    DataView: "buffer byteLength byteOffset getInt8 getUint8 getInt16 getUint16 getInt32 getUint32 getBigInt64 getBigUint64 getFloat16 getFloat32 getFloat64 setInt8 setUint8 setInt16 setUint16 setInt32 setUint32 setBigInt64 setBigUint64 setFloat16 setFloat32 setFloat64".split(" "),
    Int8Array: typedArrayMembers,
    Uint8Array: typedArrayMembers.concat(["fromBase64", "toBase64", "setFromBase64", "fromHex", "toHex", "setFromHex"]),
    Uint8ClampedArray: typedArrayMembers,
    Int16Array: typedArrayMembers,
    Uint16Array: typedArrayMembers,
    Int32Array: typedArrayMembers,
    Uint32Array: typedArrayMembers,
    BigInt64Array: typedArrayMembers,
    BigUint64Array: typedArrayMembers,
    Float16Array: typedArrayMembers,
    Float32Array: typedArrayMembers,
    Float64Array: typedArrayMembers,
    Iterator: "from map filter take drop flatMap reduce toArray forEach some every find".split(" "),
    AsyncIterator: "from map filter take drop flatMap reduce toArray forEach some every find".split(" "),
    URL: "canParse parse createObjectURL revokeObjectURL href origin protocol username password host hostname port pathname search searchParams hash toString toJSON".split(" "),
    URLSearchParams: "append delete get getAll has set sort keys values entries forEach size toString".split(" "),
    Headers: "append delete get getSetCookie has set keys values entries forEach".split(" "),
    Request: "method url headers destination referrer referrerPolicy mode credentials cache redirect integrity keepalive signal clone json text blob arrayBuffer formData body bodyUsed".split(" "),
    Response: "error redirect json type url redirected status ok statusText headers clone json text blob arrayBuffer formData body bodyUsed".split(" "),
    ReadableStream: "locked cancel getReader pipeThrough pipeTo tee values".split(" "),
    WritableStream: "locked abort close getWriter".split(" "),
    TransformStream: "readable writable".split(" "),
    CSS: "escape supports px cm mm Q in pc pt number percent em ex ch rem lh rlh vw vh vmin vmax vb vi svw svh lvw lvh dvw dvh".split(" "),
    CSSStyleSheet: "cssRules ownerRule insertRule deleteRule replace replaceSync".split(" ")
  });
})(typeof self !== "undefined" ? self : globalThis);
