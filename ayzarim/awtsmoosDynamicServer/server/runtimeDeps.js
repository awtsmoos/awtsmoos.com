
// B"H

/**
 * B"H
 * Builds the dependency object injected into dynamic Awtsmoos routes.
 *
 * @param {object} x Runtime pieces.
 * @returns {object} Dynamic-route dependencies.
 */
function createRuntimeDeps(x) {
  return {
    createJob: x.createJob,
    makeToken: x.makeToken,
    ws: x.ws,
    TextEncoder: x.deps.TextEncoder,
    URLSearchParams: x.deps.URLSearchParams,
    binaryMimeTypes: x.deps.binaryMimeTypes,
    mimeTypes: x.deps.mimeTypes,
    path: x.deps.path,
    originalPath: x.originalPath,
    sodos: x.deps.sodos,
    fs: x.deps.fs,
    self: x.server,
    awtsMoosification: x.awtsMoosification,
    filePath: x.filePath,
    parentPath: x.parentPath,
    template: x.template,
    DosDB: x.deps.DosDB,
    require,
    location: x.fullUrl,
    request: x.request,
    response: x.response,
    console,
    url: x.deps.url,
    cookies: x.cookies,
    paramKinds: x.paramKinds,
    Utils: x.deps.Utils,
    config: x.deps.config,
    fileName: null,
    isDirectoryWithIndex: false,
    contentType: x.contentType,
    getPostData: x.getPostData,
    getPutData: x.getPutData,
    getDeleteData: x.getDeleteData,
    btoa: x.btoa,
    atob: x.atob,
    mail: x.mail,
    callAi: x.callAi,
    rulesEngine: x.deps.awtsmoosRulesEngine
  };
}

module.exports = { createRuntimeDeps };
