//B"H

import awtsmoosTextEdit from "./programs/awtsmoos-text/index.js";
import awtsmoosFileExplorer from "./programs/awtsmoos-file-explorer/index.js";
import awtsmoosBinaryViewer from "./programs/awtsmoos-binary-viewer/index.js";
var programs = {
  awtsmoosTextEdit,
  awtsmoosFileExplorer,
  awtsmoosBinaryViewer 
}

var programsByExtensionDefaults = {
  ".txt": "awtsmoosTextEdit",
  ".js": "awtsmoosTextEdit",
  ".html":"awtsmoosTextEdit",
  ".css":"awtsmoosTextEdit",
  ".json":"awtsmoosTextEdit",
  ".folder":"awtsmoosFileExplorer"
}

function getDefaultProgram(ext) {
	var progName = programsByExtensionDefaults [ext] || 
		"awtsmoosBinaryViewer";
	return programs[progName];	
}

export {
  programsByExtensionDefaults,
  programs,
  getDefaultProgram
}
