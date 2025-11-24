//B"H
var p = new DOMParser()
var ap = p => `https://he.wikisource.org/w/api.php?action=parse&format=json&page=${
    p
}`;

async function start(id) {
    var mef = await gd(ap(`מ"ג_${id}`), 1);
    var tx = mef.parse.text["*"];
    var dc = p.parseFromString(tx, "text/html");
    
    console.log(window.a = dc);
    var ind = await gd(ap(
        id+"/טעמים"
    ), 1);

    var txi = ind.parse.text["*"];
    var dci = p.parseFromString(txi, "text/html");


    
    var rp = getPerek(dci);
    
    var pair = parsePerekHtml(rp);
    
    return {
        m:getMefarshim(dc)
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
async function gd(url, isJ) {
    
    var t = await (await fetch(url))[
        isJ ? "json" : "text"
    ]();
    if(isJ) return t;
    var d = p.parseFromString(
        t, "text/html"
    )
    return d;
}





function parseCommentaryPage(htmlString, commentatorNameOverride = null, bookNameOverride = null, chapterNumberOverride = null) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const outputDiv = doc.querySelector('.mw-parser-output');

    if (!outputDiv) {
        console.error("Could not find .mw-parser-output div in the provided HTML string.");
        return null;
    }

    // Try to get metadata first, but parsing strategies should not depend on it.
    const detectedCommentator = getCommentatorName(doc, outputDiv);
    const detectedChapterInfo = getChapterInfo(doc, outputDiv);

    const commentator = commentatorNameOverride || detectedCommentator;
    const bookName = bookNameOverride || detectedChapterInfo.book;
    const chapter = chapterNumberOverride || detectedChapterInfo.chapter;

    const result = {
        bookName: bookName,
        chapter: chapter,
        commentator: commentator,
        verses: {}
    };

    let parsedByH2H3 = parseStrategyHeadings(outputDiv, result);
    let parsedByParagraphs = false;
    
    // Only try paragraph strategy if H2/H3 didn't yield much or for specific commentators
    // known to use this, or as a general fallback.
    // For now, let's try it if the first strategy didn't get much.
    if (!parsedByH2H3 || Object.keys(result.verses).length < 1) { // Heuristic: if less than 1 verse found
        parsedByParagraphs = parseStrategyParagraphStarters(outputDiv, result);
    }

    // The Rashi-like span parsing is often an *addition* to verse blocks already found by H2/H3.
    // It needs a currentVerseNum context.
    parseStrategyPhraseSpans(outputDiv, result);


    // If still no verses, it's a problem
    if (Object.keys(result.verses).length === 0) {
        console.warn(`Parser found no verses for ${result.commentator} on ${result.bookName} ${result.chapter}. HTML structure might be unhandled.`);
    }
    
    // Final consolidation of potentially fragmented verse commentaries
    for (const verseNumStr in result.verses) {
        const commentaries = result.verses[verseNumStr];
        if (commentaries.length > 1) {
            // Simple merge: combine all text, keep first sourceId/phrase
            // More sophisticated merging might be needed if entries are truly distinct sub-comments
            const combinedText = commentaries.map(c => c.text).join("\n\n").trim();
            if (combinedText) { // Ensure we don't create an empty commentary
                result.verses[verseNumStr] = [{
                    text: combinedText,
                    sourceElementId: commentaries[0].sourceElementId,
                    phraseInVerse: commentaries[0].phraseInVerse, // This can be ambiguous if merging different phrases
                    spans_until_verse: commentaries[0].spans_until_verse // Ditto
                }];
            } else {
                delete result.verses[verseNumStr]; // Remove empty verse entries
            }
        } else if (commentaries.length === 1 && !commentaries[0].text.trim()) {
            delete result.verses[verseNumStr]; // Remove verse entries that ended up empty
        }
    }


    return result;
}

// --- METADATA EXTRACTION (Heuristic, as before) ---
function getCommentatorName(doc, outputDiv) {
    // Try nav bars
    const navLinks = outputDiv.querySelectorAll('div[style*="border: 1px solid #aaaaaa"] a[title]');
    for (const link of navLinks) {
        const title = link.title;
        if (title.includes(" על בראשית") || title.includes(" על התורה") || title.includes(" על רש\"י")) {
            return title.replace(/\s*על\s*(בראשית|התורה|רש"י).*/, '').trim();
        }
    }
    // Try page title
    const pageTitleElement = doc.querySelector('title');
    if (pageTitleElement) {
        const pageTitle = pageTitleElement.textContent;
        const match = pageTitle.match(/^([^\/\(]+?)\s+על\s+/);
        if (match && match[1]) return match[1].trim();
    }
    // Fallbacks based on content patterns (less reliable)
    if (outputDiv.textContent.includes("בעל הטורים על התורה")) return "בעל הטורים";
    if (outputDiv.textContent.includes("תולדות אהרן על התורה")) return "תולדות אהרן"; // Assuming a title like this might exist
    if (outputDiv.textContent.includes("בכור שור על")) return "בכור שור";
    if (outputDiv.textContent.includes("ברטנורא על התורה")) return "ברטנורא";
    if (outputDiv.textContent.includes("רבינו בחיי על")) return "רבינו בחיי";
    if (outputDiv.textContent.includes("גור אריה על רש\"י")) return "גור אריה על רש\"י";
    if (outputDiv.textContent.includes("מלבי\"ם על")) return "מלבי\"ם";
    if (outputDiv.textContent.includes("אברבנאל על")) return "אברבנאל";


    return "Unknown Commentator";
}

function getChapterInfo(doc, outputDiv) {
    let book = "בראשית";
    let chapter = 1;

    const navElements = outputDiv.querySelectorAll('div[style*="border: 1px solid #aaaaaa"]');
    for (const nav of navElements) {
        const links = nav.querySelectorAll('a');
        let bookFoundInNav = false;
        for (const link of links) {
            if (link.title && (link.title.includes(" על בראשית") || link.title.includes(" על התורה"))) {
                const bookMatch = link.title.match(/על\s+([\u0590-\u05FF]+)/);
                if (bookMatch && bookMatch[1]) {
                    book = bookMatch[1].trim();
                    bookFoundInNav = true;
                }
            }
            if (link.classList.contains('selflink') && link.textContent.trim().length > 0) {
                 const chapterNum = hebrewLetterToNumber(link.textContent.trim());
                 if (chapterNum !== -1 && chapterNum > 0 && chapterNum <= 180) {
                    chapter = chapterNum;
                    if (bookFoundInNav) return { book, chapter };
                 }
            }
        }
    }
    
    const parashaHeading = Array.from(outputDiv.querySelectorAll('h2 > .mw-headline')).find(s => s.id && s.id.startsWith('פרשת_'));
    if (parashaHeading) {
        const parashaText = parashaHeading.textContent.replace('פרשת ', '').trim();
         if (["בראשית", "נח", "לך-לך"].includes(parashaText)) book = "בראשית"; // Example mapping

        let nextP = parashaHeading.parentElement.nextElementSibling;
        if (nextP && nextP.tagName === 'P' && nextP.textContent.includes("פרק-")) {
            const chapterMatch = nextP.textContent.match(/פרק-([\u0590-\u05FF]+)/);
            if (chapterMatch && chapterMatch[1]) {
                const chapNum = hebrewLetterToNumber(chapterMatch[1]);
                if (chapNum !== -1) chapter = chapNum;
            }
        }
    }
    return { book, chapter };
}


// --- UTILITY FUNCTIONS (hebrewLetterToNumber, parseVerseNumberFromText) ---
function hebrewLetterToNumber(letterSequence) {
    const gematria = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
        'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
        'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
    };
    let sum = 0;
    let valid = false;
    for (let i = 0; i < letterSequence.length; i++) {
        const char = letterSequence[i];
        if (gematria[char]) {
            sum += gematria[char];
            valid = true;
        } else {
            return -1; 
        }
    }
    return valid ? sum : -1;
}

function parseVerseNumberFromText(text) {
    if (!text) return -1;
    text = text.trim();
    
    // Try "פסוק כו", "פסוק א"
    let match = text.match(/^(?:פסוק\s+)?([\u0590-\u05FF]{1,3})(?:$|\W)/);
    if (match) {
        const num = hebrewLetterToNumber(match[1]);
        if (num > 0 && num <= 200) return num;
    }
    // Try "(א)"
    match = text.match(/^\(([\u0590-\u05FF]{1,3})\)/);
    if (match) {
        const num = hebrewLetterToNumber(match[1]);
         if (num > 0 && num <= 200) return num;
    }
    // Try "א." or "א:" or just "א" (if it's short, likely a verse number)
    match = text.match(/^([\u0590-\u05FF]{1,3})(?:[:\.\s]|$)/);
     if (match && match[1].length <=3) { // Allow up to 3 letters for higher verse numbers like קכא
        const num = hebrewLetterToNumber(match[1]);
        if (num > 0 && num <= 200) return num;
    }
    return -1;
}


function cleanHtmlPreservingSomeTags(element, result) {
    if (!element) return "";
    const clone = element.cloneNode(true);

    // Remove specific noise elements first
    clone.querySelectorAll('span.mw-editsection, span.plainlinks a.external.text[href*="action=edit"], sup.reference, ol.references, style, script').forEach(el => el.remove());
    
    // Remove initial verse quote (span.psuq2) - more carefully
    const psuq2Spans = Array.from(clone.querySelectorAll('span.psuq2'));
    psuq2Spans.forEach(span => {
        if (!span.parentElement) return;
        const parent = span.parentElement;
        const spanText = span.textContent.trim();

        // If the span is the first significant content of its parent P and looks like a quote
        if (parent.tagName === 'P' && parent.firstChild === span && spanText.endsWith(':')) {
            span.remove();
        } else if (parent.childNodes.length === 1 && parent.firstChild === span && spanText.endsWith(':')) {
            // If parent only has this span
             span.remove();
        }
        // More advanced: check if the text *after* this span in the parent is very short, implying the span was the main quote
    });

    // For Toldos Aharon UL, reformat it as text but keep links if desired (complex)
    // For now, let's assume if it's Toldos Aharon, the previous text extraction logic in parseStrategyHeadings handles it okay for text.
    // If HTML is needed from ULs, this function needs more specific logic for it.

    // Sanitize remaining HTML:
    // This is a basic sanitizer. For production, a robust library like DOMPurify is recommended.
    const allowedTags = ['p', 'b', 'strong', 'i', 'em', 'a', 'br', 'ul', 'ol', 'li', 'span', 'div', 'dl', 'dt', 'dd'];
    const allElements = clone.getElementsByTagName('*');

    for (let i = allElements.length - 1; i >= 0; i--) {
        const el = allElements[i];
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            // Replace disallowed tag with its content
            const parent = el.parentNode;
            if (parent) {
                while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                }
                parent.removeChild(el);
            }
        } else if (el.tagName.toLowerCase() === 'a') {
            // Keep 'href' for <a> tags, remove others like 'title' if not needed
            const href = el.getAttribute('href');
            const text = el.textContent;
            // Remove all attributes except href
            for (let j = el.attributes.length - 1; j >= 0; j--) {
                if (el.attributes[j].name !== 'href') {
                    el.removeAttribute(el.attributes[j].name);
                }
            }
            if (!href || (!href.startsWith('/wiki/') && !href.startsWith('http'))) { // Basic check for valid links
                 // If not a valid link, replace with text content
                const textNode = document.createTextNode(text);
                el.parentNode.replaceChild(textNode, el);
            }
        } else {
            // Remove all attributes from other allowed tags (optional, for stricter cleaning)
            // for (let j = el.attributes.length - 1; j >= 0; j--) {
            //     el.removeAttribute(el.attributes[j].name);
            // }
        }
    }
    
    // Trim leading/trailing whitespace from the resulting HTML
    let cleanedHtml = clone.innerHTML.trim();
    // Remove paragraphs that only contain   or are empty after cleaning
    cleanedHtml = cleanedHtml.replace(/<p>(\s| )*<\/p>/gi, '');
    
    return cleanedHtml;
}

function addCommentary(result, verseNum, text, sourceElementId = null, phraseInVerse = null, spansUntil = null) {
    if (verseNum === -1 || !text || text.length < 2) return; // Ignore very short/empty text
    const verseStr = String(verseNum);
    if (!result.verses[verseStr]) {
        result.verses[verseStr] = [];
    }
    
    const newEntry = {
        text: text,
        sourceElementId: sourceElementId,
        phraseInVerse: phraseInVerse,
        spans_until_verse: spansUntil
    };

    // Avoid adding nearly identical commentary for the same verse.
    const isDuplicate = result.verses[verseStr].some(existing => 
        existing.text.length === newEntry.text.length && existing.text.startsWith(newEntry.text.substring(0, Math.max(20, newEntry.text.length -5)))
    );

    if (!isDuplicate) {
        result.verses[verseStr].push(newEntry);
    }
}

// --- PARSING STRATEGIES (Commentator-Agnostic) ---
function parseStrategyHeadings(outputDiv, result) {
    let parsedSomething = false;
    const children = Array.from(outputDiv.children);
    let currentVerseNum = -1;
    let currentCommentaryHTML = ""; // Store as HTML to preserve formatting
    let currentSourceId = null;

    function finalizePreviousVerse() {
        if (currentVerseNum !== -1 && currentCommentaryHTML.trim()) {
            // Clean the accumulated HTML *before* adding
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = currentCommentaryHTML;
            const cleanedText = cleanHtmlPreservingSomeTags(tempDiv, result); // Use the new cleaning function
            
            addCommentary(result, currentVerseNum, cleanedText, currentSourceId);
            parsedSomething = true;
        }
        currentCommentaryHTML = ""; // Reset
    }

    for (const el of children) {
        let isVerseHeading = false;
        let potentialVerseNum = -1;
        let potentialSourceId = null;
        let headingElement = null;

        if (el.classList && el.classList.contains('mw-heading')) {
            headingElement = el.querySelector('h2[id], h3[id]');
        } else if (el.matches('h2[id], h3[id]')) {
            headingElement = el;
        }

        if (headingElement && headingElement.id) {
            // Try to parse verse number from ID (e.g., "א", "ד", "פסוק_כו")
            if (headingElement.id.startsWith('פסוק_')) {
                potentialVerseNum = hebrewLetterToNumber(headingElement.id.substring('פסוק_'.length));
            } else if (headingElement.id.match(/^[\u0590-\u05FF]{1,3}$/)) { // Hebrew letters as ID
                potentialVerseNum = hebrewLetterToNumber(headingElement.id);
            }
            
            if (potentialVerseNum !== -1) {
                isVerseHeading = true;
                potentialSourceId = headingElement.id;
            }
        }
        
        // Fallback: Try to parse verse from heading text content if ID didn't work or wasn't a verse ID
        if (!isVerseHeading && headingElement && headingElement.textContent) {
            const verseNumFromText = parseVerseNumberFromText(headingElement.textContent.trim());
            if (verseNumFromText !== -1) {
                potentialVerseNum = verseNumFromText;
                isVerseHeading = true;
                potentialSourceId = headingElement.id || `text_${verseNumFromText}`;
            }
        }


        if (isVerseHeading) {
            finalizePreviousVerse(); // Save commentary for the verse that just ended
            currentVerseNum = potentialVerseNum;
            currentSourceId = potentialSourceId;
            // Do not add the heading itself to commentary
        } else {
            // If it's not a heading, and we have an active verse, append its HTML
            if (currentVerseNum !== -1) {
                 // Avoid collecting nav bars or reference lists as commentary
                if (!el.matches('div[style*="border: 1px solid #aaaaaa"]') &&
                    !el.matches('ol.references') &&
                    !el.querySelector('div[style*="border: 1px solid #aaaaaa"]')) {
                    currentCommentaryHTML += el.outerHTML;
                }
            }
        }
    }

    // Finalize any remaining commentary after the loop
    finalizePreviousVerse();

    return parsedSomething;
}

function parseStrategyParagraphStarters(outputDiv, result) {
    let parsedSomething = false;
    const paragraphs = outputDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
        const firstChild = p.firstChild;
        let verseNum = -1;
        let textToParseForVerse = "";

        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
            textToParseForVerse = firstChild.textContent.trim().split(/\s+/)[0]; // Get first "word"
        } else if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE && firstChild.tagName === 'B') {
            textToParseForVerse = firstChild.textContent.trim().split(/\s+/)[0];
        }
        
        verseNum = parseVerseNumberFromText(textToParseForVerse);

        if (verseNum !== -1) {
            const fullCommentaryText = cleanTextContent(p);
            // Attempt to remove the verse indicator from the start of the commentary
            const commentaryOnly = fullCommentaryText.replace(new RegExp(`^${textToParseForVerse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '').trim();
            
            if (commentaryOnly) {
                addCommentary(result, verseNum, commentaryOnly, `p_verse_${verseNum}_heuristic`);
                parsedSomething = true;
            }
        }
    });
    return parsedSomething;
}

function parseStrategyPhraseSpans(outputDiv, result) {
    // This strategy needs a current verse context. It should ideally run *after*
    // parseStrategyHeadings has populated some verses, or if we can reliably determine
    // the verse for a block of <p> tags.
    let parsedSomething = false;
    let lastKnownVerseForSpans = -1;

    const allElements = Array.from(outputDiv.children);

    for (const el of allElements) {
        if (el.matches('div.mw-heading > h2[id], h2[id], h3[id]')) {
            let verseNumFromId = -1;
            const headingElement = el.matches('h2[id], h3[id]') ? el : el.querySelector('h2[id], h3[id]');
            if (headingElement && headingElement.id) {
                 if (headingElement.id.startsWith('פסוק_')) {
                    verseNumFromId = hebrewLetterToNumber(headingElement.id.substring('פסוק_'.length));
                } else if (headingElement.id.match(/^[\u0590-\u05FF]{1,3}$/)) {
                    verseNumFromId = hebrewLetterToNumber(headingElement.id);
                }
            }
            let verseNumFromContent = -1;
             if (headingElement) {
                const spanInHeading = headingElement.querySelector('span[id]');
                if(spanInHeading && spanInHeading.id && spanInHeading.id.match(/^[\u0590-\u05FF]{1,3}$/)) {
                    verseNumFromContent = hebrewLetterToNumber(spanInHeading.id);
                } else if (spanInHeading && spanInHeading.textContent) {
                    verseNumFromContent = parseVerseNumberFromText(spanInHeading.textContent.trim());
                }
                 if (verseNumFromContent === -1 && headingElement.textContent) { 
                     verseNumFromContent = parseVerseNumberFromText(headingElement.textContent.trim());
                }
            }
            const potentialVerse = verseNumFromId !== -1 ? verseNumFromId : verseNumFromContent;
            if (potentialVerse !== -1) {
                lastKnownVerseForSpans = potentialVerse;
            }
        }

        if (el.tagName === 'P' && lastKnownVerseForSpans !== -1) {
            const phraseSpans = el.querySelectorAll('span[id]');
            if (phraseSpans.length > 0) {
                phraseSpans.forEach(span => {
                    const psuqSpan = span.querySelector('span.psuq2');
                    const phraseText = psuqSpan ? psuqSpan.textContent.trim() : span.id.replace(/_/g, ' ').replace(/%[\dA-F]{2}/g, ' '); // Decode URI

                    // The commentary is usually the text content of the span[id] itself,
                    // after removing the psuq2 (quoted phrase).
                    let commentaryForPhrase = "";
                    let spanClone = span.cloneNode(true);
                    if (spanClone.querySelector('span.psuq2')) {
                        spanClone.querySelector('span.psuq2').remove();
                    }
                    commentaryForPhrase = cleanTextContent(spanClone); // Clean the remaining content of the span
                    
                    // If the span itself is empty after removing psuq2,
                    // the commentary might be the rest of the <p> tag after this span.
                    if (!commentaryForPhrase.trim() && span.nextSibling) {
                        let restOfP = "";
                        let current = span.nextSibling;
                        while(current) {
                            restOfP += current.textContent;
                            current = current.nextSibling;
                        }
                        commentaryForPhrase = cleanTextContent(document.createRange().createContextualFragment(`<div>${restOfP}</div>`));
                    }


                    if (commentaryForPhrase.trim()) {
                        addCommentary(result, lastKnownVerseForSpans, commentaryForPhrase.trim(), span.id, phraseText);
                        parsedSomething = true;
                    }
                });
            }
        }
    }
    return parsedSomething;


}



async function getCommentaryFromURL(url) {
    //https://he.wikisource.org/wiki/%D7%9B%D7%9C%D7%99_%D7%99%D7%A7%D7%A8_%D7%A2%D7%9C_%D7%91%D7%A8%D7%90%D7%A9%D7%99%D7%AA_%D7%90

    var m = url.replace("https://he.wikisource.org/wiki/", "")
    var g = await gd(ap(m), 1)
    var d = g.parse.text["*"]
    var com = parseCommentaryPage(d)
    return com;
}


a=await start("בראשית_א")