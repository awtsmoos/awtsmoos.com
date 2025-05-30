//B"H
async function start(id) {
    var mef = await gd('https://he.wikisource.org/wiki/מ"ג_'+id);
    var ind = await gd("https://he.wikisource.org/wiki/"+id+"/טעמים")
    var rp = getPerek(ind)
    var pair = parsePerekHtml(rp)
    return {
        m:getMefarshim(mef)
            ,
        ind:pair 
    }
}

function getPerek(p) {
    var v = (
        p.querySelector(".mw-content-rtl.mw-parser-output div[lang='hbo'] p")
    )
    return v.innerHTML
}
function getMefarshim(m) {
    var p = m.querySelectorAll(".mw-content-rtl.mw-parser-output ul a")
    var a = Array.from(p)
    var m = a.map(q=>({
        href:q.href,
        name: q.innerText
    }))
    return m;
}


function parsePerekHtml(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const verses = [];

    // Attempt to get Book Name and general Chapter letter from the very first Aliyah marker
    let bookName = "Unknown";
    let globalChapterLetter = ""; // e.g., "א" for chapter 1

    const firstAliyahMarker = doc.querySelector('span[style*="float: left"]');
    if (firstAliyahMarker) {
        const bookElem = firstAliyahMarker.querySelector('span[style*="color: #016200"] b');
        if (bookElem) {
            bookName = bookElem.textContent.trim();
        }
        const chapterNumElem = firstAliyahMarker.querySelector('span[style*="color: #800000"]');
        if (chapterNumElem) {
            globalChapterLetter = chapterNumElem.textContent.trim();
        }
    }

    let currentAliyah = null;
    if (bookName !== "Unknown" && bookName !== "לוי" && bookName !== "ישראל") { // If the first tag is the book name
        currentAliyah = bookName;
    }


    // Select all verse ID spans, which are good anchors for each verse
    const idSpans = Array.from(doc.querySelectorAll('span[id^="א_"], span[id^="ב_"], span[id^="ג_"]')); // Extend if more chapter letters

    for (const idSpan of idSpans) {
        const verseData = {};
        verseData.id = idSpan.id; // e.g., "א_א"

        const [idChapter, idVerseNum] = verseData.id.split('_');
        verseData.chapter_hebrew_from_id = idChapter;
        verseData.verse_hebrew_from_id = idVerseNum;


        // --- Verse Numbering and Links ---
        // The span containing verse numbers/links is usually the previous sibling of idSpan
        const verseNumberingSpan = idSpan.previousElementSibling;
        if (verseNumberingSpan && verseNumberingSpan.matches('span[style*="float: right"]')) {
            const selfLinkA = verseNumberingSpan.querySelector('a.mw-selflink');
            if (selfLinkA) {
                verseData.verse_display_num = selfLinkA.textContent.trim();
            }
            const redirectLinkA = verseNumberingSpan.querySelector('a.mw-redirect');
            if (redirectLinkA) {
                verseData.verse_link_num = redirectLinkA.textContent.trim();
                verseData.wiki_link = redirectLinkA.getAttribute('href');
                verseData.wiki_title = redirectLinkA.getAttribute('title');
            }
        }

        // --- Aliyah Tag ---
        // The Aliyah tag span is potentially the previous sibling of verseNumberingSpan
        if (verseNumberingSpan) {
            const aliyahCandidateSpan = verseNumberingSpan.previousElementSibling;
            if (aliyahCandidateSpan && aliyahCandidateSpan.matches('span[style*="float: left"]')) {
                const aliyahTagInnerSpan = aliyahCandidateSpan.querySelector('span[style*="color: #016200"]');
                if (aliyahTagInnerSpan) {
                    let aliyahText = aliyahTagInnerSpan.textContent.trim();
                    // Check for bolded book name (like <b>בראשית</b>)
                    const boldTag = aliyahTagInnerSpan.querySelector('b');
                    if (boldTag) {
                        aliyahText = boldTag.textContent.trim();
                    }

                    aliyahText = aliyahText.replace(/^\[|]$/g, ''); // Remove brackets like [לוי] -> לוי

                    if (aliyahText.startsWith('ע"כ ')) { // End of Aliyah marker
                        const actualAliyahEnded = aliyahText.substring(4).trim(); // e.g., "ישראל"
                        verseData.aliyah_ends_here_marker = aliyahText; // Store the "ע"כ ישראל"
                        // The current verse still belongs to this aliyah that is ending
                        currentAliyah = actualAliyahEnded;
                        // For subsequent verses, this aliyah is finished.
                        // We'll set currentAliyah to null *after* assigning it to this verse,
                        // effectively making the *next* verse not have this aliyah unless a new one starts.
                    } else if (["בראשית", "לוי", "ישראל"].includes(aliyahText)) {
                        currentAliyah = aliyahText;
                    }
                     // If the book name itself is used as an aliyah (e.g. "בראשית")
                    else if (aliyahText === bookName && currentAliyah !== bookName){
                        currentAliyah = aliyahText;
                    }
                }
            }
        }
        if (currentAliyah) {
            verseData.aliyah = currentAliyah;
        }
        if (verseData.aliyah_ends_here_marker && verseData.aliyah_ends_here_marker.startsWith('ע"כ ')) {
            // After this verse, this aliyah is no longer active for subsequent verses
             // unless a new one is declared. The `currentAliyah` variable was set to the
             // name of the aliyah ending. For the *next* iteration, it needs to be clear
             // that this aliyah has ended for *subsequent* verses.
             // This will be handled by currentAliyah potentially being overwritten by a new tag,
             // or if no new tag, the next verse won't have an aliyah.
             // To make it explicit for the *next* verse if no new tag:
             // For this verse, `currentAliyah` IS the aliyah. For the *next* verse, it's over.
             // So, after processing *this* verse, we can consider `currentAliyah` for the next one.
             // The logic is tricky. Let's simplify: the `aliyah` field gets the correct name.
             // If it's an end marker, `currentAliyah` for the *next* pasuk should be null
             // unless a new aliyah is specified for that next pasuk.
        }


        // --- Verse Text ---
        let textContent = "";
        let currentNode = idSpan.nextSibling;
        while (currentNode) {
            // Stop if we hit the start of the next verse's metadata structure or a major break
            if (currentNode.nodeName === "SPAN" &&
                (currentNode.hasAttribute('id') || // next id span
                 (currentNode.style && currentNode.style.float === 'left') || // next aliyah span
                 (currentNode.style && currentNode.style.float === 'right')    // next verse num span
                )) {
                break;
            }
            if (currentNode.nodeName === "BR") { // Stop at <br> tags that separate sections
                // Check if the <br> is followed by another <br> (double break)
                if (currentNode.nextSibling && currentNode.nextSibling.nodeName === "BR") break;
                 // Or if <br> is followed by the specific whitespace and then <br>
                if (currentNode.nextSibling && currentNode.nextSibling.nodeType === Node.TEXT_NODE &&
                    currentNode.nextSibling.textContent.trim() === "　　" && // Specific Unicode space
                    currentNode.nextSibling.nextSibling && currentNode.nextSibling.nextSibling.nodeName === "BR") {
                    break;
                }
            }

            if (currentNode.nodeType === Node.TEXT_NODE) {
                textContent += currentNode.textContent;
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // Include text from child elements like <big>, <b>, <small>
                textContent += currentNode.textContent;
            }
            currentNode = currentNode.nextSibling;
        }
        verseData.text = textContent.trim().replace(/\s+/g, ' ');


        // --- Reference String ---
        const chapterForRef = globalChapterLetter || verseData.chapter_hebrew_from_id;
        const verseNumForRef = verseData.verse_display_num || verseData.verse_link_num || verseData.verse_hebrew_from_id;
        if (bookName !== "Unknown" && chapterForRef && verseNumForRef) {
            verseData.reference = `${bookName} ${chapterForRef}:${verseNumForRef}`;
        }

        // Ensure Kohen is not present if not specified by the HTML
        if (verseData.aliyah && !["בראשית", "לוי", "ישראל"].includes(verseData.aliyah)) {
             // This case might occur if bookName was misidentified as an aliyah and no other aliyah tag found.
             // Or if an aliyah tag was something unexpected.
             // For safety, if it's not one of the expected tags, clear it.
             // However, "בראשית" can be an aliyah itself.
            if (verseData.aliyah !== bookName) { // Allow bookName to be an aliyah
                 // delete verseData.aliyah;
            }
        }


        verses.push(verseData);

        // If this verse marked the end of an aliyah, reset currentAliyah for the next verse
        // so it doesn't carry over unless a new aliyah tag is found for the next verse.
        if (verseData.aliyah_ends_here_marker) {
            currentAliyah = null;
        }
    }

    return verses;
}

// --- HOW TO USE ---
// Assume `perekHtmlContent` is a variable holding the HTML string from perek.html
// const perekHtmlContent = `... your HTML string ...`;
// const jsonData = parsePerekHtml(perekHtmlContent);
// console.log(JSON.stringify(jsonData, null, 2));
async function gd(url) {
    var p = new DOMParser()
    var t = await (await fetch(url)).text();
    var d = p.parseFromString(
        t, "text/html"
    )
    return d;
}


a=await start("בראשית_א")