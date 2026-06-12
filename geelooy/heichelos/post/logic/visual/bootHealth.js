// B"H
/** Chapter 306: The reader states its own health. */
export function reportReaderBootHealth() {
  const report = {
    css: [...document.styleSheets].some(sheet => String(sheet.href || '').includes('/heichelos/post/styles/main.css')),
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    realPost: Boolean(document.getElementById('realPost')),
    container: Boolean(document.getElementById('virtual-scroll-container'))
  };
  window.__awtsmoosReaderBootHealth = report;
  if (!report.css || !report.realPost) console.warn('B"H reader health warning', report);
  return report;
}
