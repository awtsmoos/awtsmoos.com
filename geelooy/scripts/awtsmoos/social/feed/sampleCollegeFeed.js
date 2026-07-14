// B"H
/** Premium sample posts blended near the top so the feed is visibly alive while real Ikar data is sparse. */
const AUTHORS = ['Maya Stern', 'Noam Levy', 'Talia Brooks', 'Eli Cohen', 'Sam Rivera', 'Ari Katz', 'Nava Green', 'Jordan Weiss'];
const HOUSES = ['North Quad', 'Beis Midrash', 'Library 3F', 'Student Union', 'Dorm B', 'Café 18', 'Science Hall'];
const TYPES = ['post', 'question', 'announcement', 'event', 'media', 'bookmark'];
const TOPICS = [
  ['Study group forming', 'Calc II review tonight at the quiet tables. Bring old quizzes, coffee, and patience. We are making a shared summary doc and splitting practice problems by chapter.'],
  ['Lost hoodie found', 'Blue university hoodie near the vending machines. It has a tiny coffee stain shaped like a comet. I left it with the front desk after waiting ten minutes.'],
  ['Shabbos meal seats', 'Two open seats for dinner. Message if you need a place or know a freshman who does. Warm food, singing, and no pressure.'],
  ['Dorm store run', 'Heading to the store in 20 minutes. Drop requests before I leave North Quad. I can grab notebooks, snacks, batteries, and basic medicine.'],
  ['Club fair reminder', 'Robotics, poetry, debate, and the midnight kugel society all have booths today. Come find your people before the tables vanish.'],
  ['Library table claim', 'We have one big table by the windows. Finals energy is intense but friendly. There are chargers, index cards, and one emergency chocolate bar.'],
  ['Campus photo drop', 'Sunset over Science Hall looked unreal. The clouds were basically doing typography. Posting the best shots here for anyone making the semester recap.'],
  ['Professor quote board', 'Quote of the day: “Your proof is almost a proof, which means it is currently a dream.” Somehow motivating and devastating at once.'],
  ['Roommate question', 'Is anyone else’s radiator making whale sounds or is our room uniquely blessed? Maintenance says it is “probably fine,” which is not a sentence of comfort.'],
  ['Free pizza intel', 'Student Union second floor. Repeat: free pizza, still warm, moving fast. There are two veggie boxes and one mysterious unlabeled box.']
];
export function sampleCollegePage(page = 0, pageSize = 8) { return Array.from({ length: pageSize }, (_, index) => buildObject(page, index)); }
export function seedCollegeFeed(existing = [], minimum = 12) {
  const count = existing.length >= minimum ? 7 : Math.max(7, minimum - existing.length);
  return blendCollegeFeed(existing, count);
}
export function blendCollegeFeed(existing = [], sampleCount = 8) {
  const samples = sampleCollegePage(0, sampleCount).map((item, index) => ({ ...item, id:`${item.id}-blend-${index}` }));
  const leadReal = existing.find(item => !isSparse(item)) ? existing.slice(0, 1) : [];
  const restReal = leadReal.length ? existing.slice(1) : existing;
  return [...leadReal, ...samples.slice(0, 4), ...restReal.slice(0, 4), ...samples.slice(4), ...restReal.slice(4)];
}
function isSparse(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`.replace(/<[^>]*>/g, '').trim();
  return text.length < 24 || /^(answer|question|post)$/i.test(String(item.title || item.summary || '').trim());
}
function buildObject(page, index) {
  const n = page * 8 + index, [title, summary] = TOPICS[n % TOPICS.length], type = TYPES[n % TYPES.length];
  const place = HOUSES[(n + page) % HOUSES.length], authorAlias = AUTHORS[n % AUTHORS.length];
  return { id:`college-sample-${page}-${index}-${n}`, contentId:`college-sample-${page}-${index}-${n}`, type, title:decorateTitle(title, page, index), summary:`${summary} · ${place}`, authorAlias, heichelId:'campus-life', seriesId:type === 'event' ? 'events' : 'root', href:'/heichelos/campus-life?view=series', assets:assetSet(type, n), sections:verseSet(title, summary, place), counts:{ comments:3 + (n % 19), reactions:12 + (n * 7) % 140 }, raw:{ sample:true, place, semester:'sample fall' } };
}
function verseSet(title, summary, place) {
  return [
    { id:'opening', label:title, text:summary },
    { id:'where', label:'Where', text:`Location: ${place}. Comments can become the verse-level discussion thread here.` },
    { id:'details', label:'Details', text:'Bring updates, reactions, and replies. This preview opens into the official post viewer.' }
  ];
}
function decorateTitle(title, page, index) { return `${title}${page ? ` #${page + 1}.${index + 1}` : ''}`; }
function assetSet(type, n) { if (type === 'media') return [{ label:'photo set' }, { label:`${2 + (n % 4)} images` }]; if (type === 'event') return [{ label:'calendar' }]; if (type === 'bookmark') return [{ label:'saved link' }]; return []; }
