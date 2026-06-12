// B"H
/** Chapter 343: A gentle classifier only fills empty section kind vessels. */
export function classifySectionKinds() {
  const sections = [...document.querySelectorAll('#realPost .section')];
  sections.forEach(section => {
    if (section.dataset.awtsmoosKind) return;
    const text = (section.textContent || '').trim();
    if (/\?$/.test(text) || text.includes('?')) section.dataset.awtsmoosKind = 'question';
    else if (/אמר|וידבר|ויאמר|מעשה/.test(text)) section.dataset.awtsmoosKind = 'story';
    else if (/פירוש|ביאור|commentary/i.test(text)) section.dataset.awtsmoosKind = 'commentary';
    else section.dataset.awtsmoosKind = 'teaching';
  });
  return sections.length;
}
