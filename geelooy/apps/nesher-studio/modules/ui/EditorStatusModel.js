/* B"H
Editor status model: one calm place for recording, export, and timeline messages.
*/
export function createEditorStatusModel() { return { message:'Ready', severity:'info', recording:null, export:null, timeline:null, updatedAt:Date.now() }; }
export function setEditorMessage(model, message, severity = 'info') { model.message = message; model.severity = severity; model.updatedAt = Date.now(); return model; }
export function setEditorRecordingStatus(model, recording) { model.recording = recording; model.updatedAt = Date.now(); return model; }
export function setEditorExportStatus(model, exp) { model.export = exp; model.updatedAt = Date.now(); return model; }
