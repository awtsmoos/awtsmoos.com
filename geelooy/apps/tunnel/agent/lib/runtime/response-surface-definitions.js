// B"H
const DEBUG_MODES = new Set(['debug', 'full', 'audit', 'raw', 'standard']);
const CORRELATION_KEYS = [
	'type','id','tunnelName','requestedTunnelName','controlRequestId','clientRequestId',
	'agentSessionId','logicalAgentId','agentName','projectRoot','workspaceId','nonce',
	'conversationId','conversationName','missionId','roomId','leaseId','parentActionId',
	'traceId','spanId','causalParentId','correlationId','actionId','vessel','routeReason',
	'requestAction','actualAction','actionMismatch','requestedAction','requestedActionRaw',
	'jobId','workerId','receiptId','stream','cwd','command','path','paths'
];
const ESSENTIAL_KEYS = [
	'content','content64','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload',
	'items','entries','detailedItems','files','dirs','order','count','returnedCount','root','absolutePath',
	'relativePath','path','exists','isDirectory','isFile','size','mtimeMs','birthtimeMs','sha256','hash',
	'bytes','written','statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','outputPagePayload',
	'outputPage','results','result','errors','diagnostics','message','record','history','session','queue',
	'queueStats','queuedMs','longLivedConnection','advisoryOvertime','retryAfterMs','retryable',
	'receipts','receipt','worker','workers','mission','cost','recovery','cleanup','processIdentity',
	'processComparison','birthToken','phase','promptCount','preview','url','viewUrl','proxyUrl','rawUrl',
	'wsUrl','detectedServers','selectedServer','agentGuidance','nextSuggestedAction','taskId','state',
	'progress','resume','plan','evidence','chrome','targets','pages','activeTarget','currentUrl',
	'currentTarget','browser','port','enabled','pid','processGroupId','version','webSocketDebuggerUrl',
	'responseShape','responseMode','responseProtocol','storage','trust','warnings','mode','syncOptIn',
	'aiInstructions','shell','timeoutMs','stdout','stderr','stdoutBytes','stderrBytes','exitCode',
	'signal','durationMs','resourceUsage','orphanReason','reconciliationAt','health','stats','lane','priority'
];

module.exports = { CORRELATION_KEYS, DEBUG_MODES, ESSENTIAL_KEYS };
