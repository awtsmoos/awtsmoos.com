// B"H
(function idTableIndex(root) {
  const source = root.AwtsEctIdTables = root.AwtsEctIdTables || {};

  /**
   * B"H. Assembly altar. Each table family lives separately, then gathers here
   * into the stable compiler-facing `AwtsEctIds` object. The vessel may grow
   * wildly, but the compiler drinks from one quiet cup.
   */
  root.AwtsEctIds = {
    roots: source.roots || [],
    members: source.members || {},
    astNodes: source.astNodes || [],
    binaryOps: source.binaryOps || [],
    logicalOps: source.logicalOps || [],
    assignmentOps: source.assignmentOps || [],
    unaryOps: source.unaryOps || [],
    updateOps: source.updateOps || [],
    declarationKinds: source.declarationKinds || [],
    phrases: source.phrases || [],
    tags: source.tags || [],
    attrs: source.attrs || [],
    cssProps: source.cssProps || [],
    units: source.units || [],
    cssKeywords: source.cssKeywords || [],
    cssValueKinds: source.cssValueKinds || [],
    ops: source.ops || {}
  };
})(typeof self !== "undefined" ? self : globalThis);
