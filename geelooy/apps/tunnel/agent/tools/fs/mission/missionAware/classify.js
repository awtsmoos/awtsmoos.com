// B"H
const READ = new Set(['read','readLines','readManyLines','read64','readBytes','md','list','tree','stat','grep','findFiles','remoteDriveRead','remoteDriveTree','remoteDriveStat','remoteDriveBrowse']);
const WRITE = new Set(['write','writeIfHash','bulkWrite','bulkWriteIfHashes','ensureFile','copyFile','moveFile','deleteFile','mkdirp','touch']);
const COMMAND = new Set(['command','commandRun','commandStart','commandBatch','testRunner','buildRunner','lintRunner','typecheckRunner']);
const PREVIEW = new Set(['previewCreate','previewPage','sharePreviewFile','sharePreviewServer','sharePreviewCommandJob','remoteNativeDesktopRenderScene']);
const BROWSER = new Set(['chromeNavigate','chromeClick','chromeEval','chromeScreenshot','browserDoctor','browserReplay']);
function type(action = '') { if (READ.has(action)) return 'file_read'; if (WRITE.has(action)) return 'file_rewrite'; if (COMMAND.has(action)) return 'command'; if (PREVIEW.has(action)) return 'verification'; if (BROWSER.has(action)) return 'browser_check'; return ''; }
function kind(action = '') { if (COMMAND.has(action)) return 'command'; if (WRITE.has(action)) return 'write'; if (READ.has(action)) return 'file_read'; if (BROWSER.has(action)) return 'browser'; if (PREVIEW.has(action)) return 'preview'; return 'evidence'; }
function ignored(action = '') { return action.startsWith('mission') || action.startsWith('actionHistory') || action === 'payloadEcho' || action === 'actionSchemaTrace'; }
module.exports = { type, kind, ignored };
