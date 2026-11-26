// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives the writer room to breathe; Awtsmoos.com keeps the simple surface free of legacy chrome. */
const icons = {
	photo: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
	audio: '<path d="M9 18V5l12-2v13M9 18c0 2-2 3-4 3s-3-1-3-2 2-3 4-3 3 1 3 2Zm12-2c0 2-2 3-4 3s-3-1-3-2 2-3 4-3 3 1 3 2Z"/>',
	video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/>'
};
function icon(name) {
	return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}
export const markup = `
<div class="screen">
<header><a class="close" aria-label="Close composer" href="/">×</a><h1>New post</h1><button id="advanced" class="link" type="button">Advanced</button></header>
<main>
<div class="identity"><span id="avatar" aria-hidden="true">●</span><div><label for="alias">Posting as</label><select id="alias" aria-label="Choose posting alias"><option value="">Choose an alias</option></select><a id="login" hidden>Sign in to Awtsmoos</a></div></div>
<button type="button" id="destination" class="destination" aria-controls="picker">＋ Choose Heichel / series</button>
<section id="picker" class="picker" hidden aria-label="Choose posting destination">
<label for="searchDestination">Find a Heichel</label><input type="search" id="searchDestination" placeholder="Search by name…" autocomplete="off">
<label for="heichel">Heichel</label><select id="heichel"><option value="">Choose a Heichel</option></select>
<label for="series">Series</label><select id="series" disabled><option value="">Choose a series</option></select>
<div class="picker-actions"><button id="cancel" type="button" class="link">Cancel</button><button id="choose" type="button" class="primary" disabled>Use destination</button></div>
</section>
<input id="title" maxlength="240" aria-label="Post title" placeholder="Title (optional)">
<textarea id="body" aria-label="Post text" placeholder="What's on your mind?"></textarea>
<p id="complex" hidden>This draft has structured content. Open Advanced to edit all its sections.</p>
<div id="attachments" class="attachments" aria-label="Selected attachments"></div>
<p id="status" role="status" aria-live="polite" hidden></p>
<div class="tools" aria-label="Attach media">
<label>${icon('photo')}Photo<input type="file" multiple accept="image/*" aria-label="Attach photos"></label>
<label>${icon('audio')}Audio<input type="file" multiple accept="audio/*,.mp3,.m4a,.wav,.ogg" aria-label="Attach audio"></label>
<label>${icon('video')}Video<input type="file" multiple accept="video/*" aria-label="Attach video"></label>
</div>
</main>
<footer><span class="audience">◎ Public</span><button id="next" type="button" class="primary">Next</button></footer>
</div>`;
