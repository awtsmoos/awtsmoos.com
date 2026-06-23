// B"H

const { me } = require("./me.js");
const { device } = require("./device.js");
const { devices } = require("./devices.js");
const { myDevice } = require("./myDevice.js");
const { apiKeys } = require("./apiKeys.js");
const { createApiKey } = require("./createApiKey.js");
const { revokeApiKey } = require("./revokeApiKey.js");
const { usage } = require("./usage.js");
const { compute, computeCapture, computeHistory, computeReceipt, computeSubscription } = require("./compute.js");
const { bank } = require("./bank.js");
const { flow } = require("./flow.js");
const { treasury } = require("./treasury.js");
const { treasuryHome } = require("./treasury/home.js");
const { treasuryBudgets } = require("./treasury/budgets.js");
const { treasuryForecast } = require("./treasury/forecast.js");
const { treasuryMarketplace } = require("./treasury/marketplace.js");
const { treasuryAgents } = require("./treasury/agents.js");
const { treasuryProviders } = require("./treasury/providers.js");
const { treasuryGraph } = require("./treasury/graph.js");
const { treasuryAdvisor } = require("./treasury/advisor.js");
const { treasuryReputation } = require("./treasury/reputation.js");
const { budgets } = require("./budgets.js");
const { reputation } = require("./reputation.js");
const { organization } = require("./organization.js");
const { agentEconomy } = require("./agentEconomy.js");
const { marketplace } = require("./marketplace.js");
const { receiptCertificate } = require("./receiptCertificate.js");
const { provider } = require("./provider.js");
const { refund } = require("./refund.js");
const { adminVault } = require("./adminVault.js");
const { resourceAccounting } = require("./resourceAccounting.js");
const { treasuryTest } = require("./treasuryTest.js");
const { adminPerutas } = require("./adminPerutas.js");
const { protectedFs } = require("./protectedFs.js");
const { previewProxy } = require("./previewProxy.js");
const { previewCreate, previewList, previewRevoke, previewSettingsGet, previewSettingsSet, previewUpdate } = require("./previewGateway.js");
const { view, viewProxy, viewRaw, viewWs } = require("./view.js");
const { conversationGet, conversationList, conversationRegister } = require("./conversations.js");
const { liveCalls } = require("./liveCalls.js");
const { ephemeralMeta, ephemeralPage, ephemeralSearch, ephemeralDelete, ephemeralList } = require("./ephemeral.js");
const { openApi } = require("./openApi.js");
const { openApiKey } = require("./openApiKey.js");
const { docsHtml } = require("./docsHtml.js");
const { docsJson } = require("./docsJson.js");
const { bootstrap } = require("./bootstrap.js");
const { osFs } = require("./osFs.js");
const { blob } = require("./blob.js");
const { blobView } = require("./blobView.js");
const { blobManifest } = require("./blobManifest.js");
const { handoff } = require("./handoff.js");

/** B"H: The route table names every treasury chamber explicitly. */
const routeTable = {
  me,
  device,
  devices,
  "my-device": myDevice,
  "api-keys": apiKeys,
  "api-keys/create": createApiKey,
  "api-keys/revoke": revokeApiKey,
  usage,
  bank,
  treasury,
  "treasury/home": treasuryHome,
  "treasury/budgets": treasuryBudgets,
  "treasury/forecast": treasuryForecast,
  "treasury/marketplace": treasuryMarketplace,
  "treasury/agents": treasuryAgents,
  "treasury/providers": treasuryProviders,
  "treasury/graph": treasuryGraph,
  "treasury/advisor": treasuryAdvisor,
  "treasury/reputation": treasuryReputation,
  budgets,
  reputation,
  flow,
  organization,
  "agent-economy": agentEconomy,
  marketplace,
  provider,
  refund,
  "admin-vault": adminVault,
  "resource-accounting": resourceAccounting,
  "treasury-test": treasuryTest,
  "receipt/certificate": receiptCertificate,
  compute,
  "compute/capture": computeCapture,
  "compute/history": computeHistory,
  "compute/receipt": computeReceipt,
  "compute/subscription": computeSubscription,
  "admin/perutas": adminPerutas,
  bootstrap,
  "ephemeral/list": ephemeralList,
  "ephemeral/:resultId/page": ephemeralPage,
  "ephemeral/:resultId/search": ephemeralSearch,
  "ephemeral/:resultId/delete": ephemeralDelete,
  "ephemeral/:resultId": ephemeralMeta,
  "preview/create": previewCreate,
  "preview/list": previewList,
  "preview/revoke": previewRevoke,
  "preview/update": previewUpdate,
  "preview/settings": previewSettingsGet,
  "preview/settings/set": previewSettingsSet,
  "conversations/register": conversationRegister,
  "conversations/list": conversationList,
  "conversations/get": conversationGet,
  "live-calls": liveCalls,
  "view/:previewId/raw": viewRaw,
  "view/:previewId/proxy": viewProxy,
  "view/:previewId/ws": viewWs,
  "view/:previewId": view,
  "handoff/:tunnelName": handoff,
  "blob/:blobId/manifest": blobManifest,
  "blob/:blobId/view": blobView,
  "blob/:blobId": blob,
  "preview/:tunnelName": previewProxy,
  "fs/awtsmoos-os": osFs,
  "fs/:tunnelName": protectedFs,
  openapi: openApi,
  "openapi-key": openApiKey,
  docs: docsHtml,
  "docs.json": docsJson
};

module.exports = { routeTable };
