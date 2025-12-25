//B"H
// State for comments
export var loadedInlineVerses = {};
export var currentVerse = null;
export var currentSub = null;

export var data = {
	aliases: null
};

export function setCurrentVerse(v) {
    currentVerse = v;
}

export function getCurrentVerse() {
    return currentVerse;
}

export function setCurrentSub(s) {
    currentSub = s;
}

export function getCurrentSub() {
    return currentSub;
}

export function invalidateVerseCache(verseSection, post) {
    if (verseSection === null || verseSection === undefined) {
        verseSection = "root";
    }
    if(!post) post = window.post;

    if (data.aliases) {
        // Clear all entries related to this verse to be safe
        Object.keys(data.aliases).forEach(key => {
            if (key.startsWith(`${verseSection}-`)) delete data.aliases[key];
        });
        delete data.aliases[verseSection];
    }
    
    const aliasCachePath = window.aliasCommentsCache?.heichelos?.[post?.heichel?.id]?.series?.[post?.parentSeriesId]?.posts?.[post?.id];
    if (aliasCachePath?.verseSections?.[verseSection]) {
        delete aliasCachePath.verseSections[verseSection];
    }
    
    const commentsCachePath = window.commentsOfAliasCache?.heichelos?.[post?.heichel?.id]?.series?.[post?.parentSeriesId]?.posts?.[post?.id];
    if (commentsCachePath?.aliases) {
        for (const alias in commentsCachePath.aliases) {
            if (commentsCachePath.aliases[alias].verseSections?.[verseSection]) {
                delete commentsCachePath.aliases[alias].verseSections[verseSection];
            }
        }
    }
}
