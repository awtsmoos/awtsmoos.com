//B"H
import codeify from "/scripts/awtsmoos/coding/make.js"; 
import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
var programs = {
  awtsmoosTextEdit,
  awtsmoosFileExplorer
}

var programsByExtensionDefaults = {
  ".txt": "awtsmoosTextEdit",
  ".js": "awtsmoosTextEdit",
  ".html":"awtsmoosTextEdit",
  ".css":"awtsmoosTextEdit",
  ".folder":"awtsmoosFileExplorer"
}

export {
  programsByExtensionDefaults,
  programs
}
