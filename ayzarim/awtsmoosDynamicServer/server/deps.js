
// B"H

const url = require("url");
const fs = require("fs").promises;
const path = require("path");
const querystring = require("querystring");
const crypto = require("crypto");

const { fetch, TextEncoder, URLSearchParams } = require("../fetch.js");
const Utils = require("../../tools/utils.js");
const config = require("../../awtsmoos.config.json");
const processTemplate = require("../awtsmoosProcessor.js");
const DosDB = require("../../DosDB/awtsmoosBinary/awtsmoosDB/api/dosdb/legacy.js");
const Auth = require("../../tools/auth.js");
const AwtsmoosResponse = require("../awtsmoosResponse.js");
const Ayzarim = require("../getAwtsmooses.js");
const TemplateObjectGenerator = require("../TemplateObjectGenerator.js");
const sodos = require("../../tools/sodos.js");
const doLogs = require("../doLogs.js");
const { binaryMimeTypes, mimeTypes } = require("../mimes.js");
const { startTaskRunner } = require("../cleanup-worker.js");
const emailIngress = require("../../email/awtsmoosEmailIngress.js");
const awtsmoosAi = require("../awtsmoosAi.js");
const awtsmoosRulesEngine = require("../../email/awtsmoosEmailRules.js");

/**
 * B"H
 * Central dependency altar for the dynamic server.
 */
module.exports = {
  url,
  fs,
  path,
  querystring,
  crypto,
  fetch,
  TextEncoder,
  URLSearchParams,
  Utils,
  config,
  processTemplate,
  DosDB,
  Auth,
  AwtsmoosResponse,
  Ayzarim,
  TemplateObjectGenerator,
  sodos,
  doLogs,
  binaryMimeTypes,
  mimeTypes,
  startTaskRunner,
  emailIngress,
  awtsmoosAi,
  awtsmoosRulesEngine
};
