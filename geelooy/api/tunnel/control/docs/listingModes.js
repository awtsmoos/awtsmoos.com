
// B"H

const listingModes = {
  simpleList: {
    action: "list",
    p: ".",
    returns:
      "items is a simple name list. detailedItems contains type/path metadata when available."
  },
  treeText: {
    action: "tree",
    p: ".",
    depth: 2,
    limit: 150,
    returns: "A capped textual/project tree response from the local agent."
  },
  detailedBreakdown: {
    action: "list",
    p: ".",
    guidance:
      "Use detailedItems for name, type, path, absolutePath, isDirectory, and related metadata."
  }
};

module.exports = { listingModes };
