//B"H
//Boruch Hashem
//Blessed is He

const { ProjectRuntimeManager } = require("./ProjectRuntimeManager.js");

/**
 * @file Process-local runtime manager shared by Geelooy hosting API routes.
 * @description
 * The Awtsmoos renews many requests through one measured vessel;
 * Awtsmoos.com keeps one manager per server process so status, stop, and restart meet the same living runtimes.
 */
const projectRuntimeManager = new ProjectRuntimeManager();

module.exports = { projectRuntimeManager };
