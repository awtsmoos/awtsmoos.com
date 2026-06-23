/* B"H */
export function createTitleLayer(input = {}) { return { id:input.id || `title-${Date.now()}`, kind:'TitleLayer', text:input.text || 'Title', start:Number(input.start || 0), duration:Number(input.duration || 3), style:{ font:input.font || '48px system-ui', color:input.color || '#ffffff', align:input.align || 'center', ...(input.style || {}) }, position:input.position || { x:.5, y:.5 } }; }
export function titleAtTime(title, time) { return time >= title.start && time <= title.start + title.duration; }
export function renderTitleCommand(title) { return { text:title.text, style:title.style, position:title.position }; }
