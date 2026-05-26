//B"H
/**
 * Sectioned content vessels let posts, comments, answers and audio transcripts
 * carry addressable inner chambers instead of collapsing discourse into one blob.
 */
export function normalizeSections(sections = []) {
  return (Array.isArray(sections) ? sections : [])
    .map((section, index) => ({
      id: section.id || `section-${index + 1}`,
      title: section.title || '',
      text: String(section.text || section.content || ''),
      order: Number(section.order || index)
    }))
    .filter(section => section.text || section.title);
}

export function sectionById(sections = [], sectionId = '') {
  return normalizeSections(sections).find(section => section.id === sectionId) || null;
}
