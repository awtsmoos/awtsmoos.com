//B"H
import {CommentSection} from "./CommentSection.js";
import {

	getCommentsByAlias, 
	getCommentsOfAlias,
	getComment,
	deleteComment,
	AwtsmoosPrompt
	 
} from "/scripts/awtsmoos/api/utils.js";
import playText from "/heichelos/post/playText.js"

import {sendIt} from
	"/scripts/awtsmoos/api/helperScripts/s3-manager.js"

import {
	addTab,
	updateQueryStringParameter,
	getLinkHrefOfEditing,
	isFirstCharacterHebrew
	
} from "/heichelos/post/postFunctions.js";


import {
	markdownToHtml
} from "/heichelos/post/parsing.js"

var loadingHTML = /*html*/`<div class="center loading">
<div class="loading-circle"></div>
</div>`;


// This object is our "memory" of what has been rendered inline.
var loadedInlineVerses = {};

var currentVerse = null;
var data = {
	aliases: null
}



/**
 * The master cache clearing function. Surgically removes all cached data for a 
 * specific verse section from all three client-side layers. This is the key
 * to forcing a fresh data load.
 */
function invalidateVerseCache(verseSection) {
    if (verseSection === null || verseSection === undefined) {
        verseSection = "root";
    }
    //console.log(`[Cache] Invalidating ALL caches for verseSection: ${verseSection}`);

    // 1. Invalidate the Component-Level Cache (our "Source of Truth")
    if (data.aliases) {
        delete data.aliases[verseSection];
    }
    
    // 2. Invalidate the API Utility Cache for commentator lists (from utils.js)
    const aliasCachePath = window.aliasCommentsCache?.heichelos?.[post.heichel.id]?.series?.[post.parentSeriesId]?.posts?.[post.id];
    if (aliasCachePath?.verseSections?.[verseSection]) {
        delete aliasCachePath.verseSections[verseSection];
    }
    
    // 3. Invalidate the API Utility Cache for actual comments (from utils.js)
    const commentsCachePath = window.commentsOfAliasCache?.heichelos?.[post.heichel.id]?.series?.[post.parentSeriesId]?.posts?.[post.id];
    if (commentsCachePath?.aliases) {
        for (const alias in commentsCachePath.aliases) {
            if (commentsCachePath.aliases[alias].verseSections?.[verseSection]) {
                delete commentsCachePath.aliases[alias].verseSections[verseSection];
            }
        }
    }
}


function sanitizeComment(cnt) {
	try {
		var p = new DOMParser();
		var dc = p.parseFromString(cnt, "text/html")
		var cl = dc.querySelector(".links_in_title");
		if(!cl) return cnt;
		//cl.parentNode.parentNode.removeChild(cl.parentNode);
		return dc.body.innerHTML
	} catch(e) {
		return cnt;	
	}
}
var curTab = null;
function addImageGallery(images, parent) {
	if (images && Array.isArray(images)) {
		const imageGallery = document.createElement("div");
		imageGallery.className = "image-gallery";
		
		images.forEach(image => {
		    const img = document.createElement("img");
		    img.src = image.medium || image.img || image;
		    img.alt = "Comment Image";
		    img.dataset.fullImageUrl = image.img || "";
		    img.onclick = () => openImageViewer(img.dataset.fullImageUrl);
		    imageGallery.appendChild(img);
		});
		
		//cmCont
		parent.appendChild(imageGallery);
	}
}

function makeTitleDiv(title) {
	var commentTitle = document.createElement("div");
	commentTitle.className="commentTitle"
	commentTitle.innerHTML = title
	if(isFirstCharacterHebrew(title)) {
		commentTitle.classList.add("heb")
	}
	return commentTitle
}
// B"H - UPDATED to use the new rendering engine
async function makeHTMLFromComment({ comment, aliasId, tab }) {
    // Create the main container for the side-panel comment
    var cmCont = document.createElement("div");
    cmCont.className = "comment-content";
    cmCont.dataset.cid = comment.id;
    tab.appendChild(cmCont);

    // Create the content area that will be populated
    var commentText = document.createElement("div");
    commentText.className = "comment-text";
    cmCont.appendChild(commentText);

    // Call the unified engine to do the rendering
    populateCommentElement(comment, commentText);

    
	
	// Three-dot menu
	var menuContainer = document.createElement("div");
	menuContainer.className = "menu-container";
	cmCont.appendChild(menuContainer);

	var menuButton = document.createElement("div");
	menuButton.className = "menu-button";
	menuButton.innerText = "⋮";
	menuContainer.appendChild(menuButton);

	var menuOptions = document.createElement("div");
	menuOptions.className = "menu-options";
	menuOptions.style.display = "none"; // Hidden by default
	menuContainer.appendChild(menuOptions);

	// Menu options
	var opts = ["Reply", "Copy"];
	if(window?.curAlias == comment.author) {
		opts = opts.concat(["Edit", "Add Audio", "Delete"])
	}
	var tr = comment?.dayuh?.transcripted;
	if(tr) {
		if(window?.curAlias == comment.author) {
			opts.push("Add Timesheet")
		}
		opts.push("Play");
		var bucket = tr["bucket"]
		var path = tr["path"]
		if(!bucket || !path) {
			console.log("No bucket",comment)
			return
		}
		var audio = document.createElement("audio");
		audio.controls = true; 
		audio.src = `https://${bucket}.awtsmoos.com/${path}`;
		audio.style.display = "none"; 
		audio.dataset.awtsmoosAudio = comment.id
		cmCont.appendChild(audio);
	}
	opts.forEach(option => {
		var menuItem = document.createElement("div");
		menuItem.className = "menu-item";
		menuItem.innerText = option;
		menuItem.onclick = () => handleMenuOption(option, comment, menuItem);
		menuOptions.appendChild(menuItem);
	});

	menuButton.onclick = (e) => {
		e.stopPropagation(); 
		menuOptions.style.display = menuOptions.style.display === "none" ? "block" : "none";
	};

	document.addEventListener("click", (e) => {
		if (!menuContainer.contains(e.target)) {
			menuOptions.style.display = "none";
		}
	});

	return comment;
}


// B"H - UPDATED to use the new rendering engine
function makeInlineComment(alias, comment) {
    var incom = document.createElement("div");
    incom.className = "inline-comment";

    var tool = makeTooltip("Open Comment");
    tool.addEventListener("click", async () => {
        var c = await openCommentsPanelToAlias(alias);
        if (!c) return;
        var con = c.querySelector(`.comment-content[data-cid="${comment.id}"]`);
        if (con) con.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    incom.appendChild(tool);

    var comContent = document.createElement("div");
    incom.appendChild(comContent);

    // Call the unified engine to do the rendering
    populateCommentElement(comment, comContent);

    return incom;
}

function openImageViewer(url) {
    if (url) {
        window.open(url, "_blank");
    }
}	
var timesheet = null;
var loop = null;
async function handleMenuOption(option, comment, el) {
	console.log("Selected:", option, "on comment:", comment);
	switch(option) {
		case "Edit": 
			alert("Coming soon iyh!") 
		break;
		case "Delete":
			try {
				var h = await deleteComment({
					heichelId: post.heichel.id,
					parentType: "post",
					parentId: post.id,
					seriesId: series.id,
					postId: post.id,
					aliasId: window.curAlias,
					commentId: comment.id
				})
				console.log(h) 
				await AwtsmoosPrompt.go({
		                    isAlert: true,
		                    headerTxt: "Successfully deleted that comment",
		                });
			} catch(e) {
				console.log(e.stack);
				await AwtsmoosPrompt.go({
		                    isAlert: true,
		                    headerTxt: "There was an issue deleting. " + e.stack,
		                });
			}
		break;
		case "Reply": 
			alert("Coming soon iyh!") 
		break;
		case "Play":
			var aud = document.querySelector("audio[data-awtsmoos-audio='" + comment.id + "'");
			if(!aud) return alert("Issue");
			var isPlaying = false;
			var tm = comment?.dayuh?.timesheet;
			var sheet = null;
			window.audio = aud;
			if(tm) {
				
				sheet = await (
					await fetch(
						"https://" + 
						tm.bucket + 
						".awtsmoos.com/"
						+ tm.path
					)
				).json()
				window.timesheet = tm;
			}
			if(sheet) {
				var els = sheet.monologues[0].elements
				if(!els) return alert("Something's weird")
				var map = createTimeHashMap(els);
				
				if(!loop) {
				var lastText = null;
				loop = () => {
					var t = aud?.currentTime;
					
					if(t) {
						
						var entry = findCurrentElementHashMap(t,map)
						if(entry !== null) {
							var letter = entry.value;
							if(
								letter != lastText &&
								letter !== null
							) {
								lastText = letter;
								console.log(letter, t)
								playText(letter)
							} else {
								console.log("WHAT again",letter)
							}
						}
						
					} else {
						console.log("WHAT", sheet)	
					}
					requestAnimationFrame(loop);
				};
				loop()
				console.log("Started loop",sheet,sheet?.monologues?.[0])
				}
			}

			function createTimeHashMap(array, resolution = 0.01) {
			    var gro = groupTimedData(array);
			    const hashMap = new Map();
			
			    gro.forEach(item => {
				for (let t = item.ts; t <= item.end_ts; t += resolution) {
				    const roundedTime = Math.round(t * (1 / resolution)) / (1 / resolution); // Match the resolution
				    hashMap.set(roundedTime, item);
				}
			    });
			
			    return hashMap;
			}
			
			// Lookup in the hash map
			function findCurrentElementHashMap(time, hashMap, resolution = 0.01) {
			    const roundedTime = Math.round(time * (1 / resolution)) / (1 / resolution);
			    var val = hashMap.get(roundedTime);
			   return val || null;
			}

			function groupTimedData(input) {
			    let groupedData = [];
			    let currentGroup = null;
			
			    input.forEach(item => {
			        if (item.ts !== undefined && item.end_ts !== undefined) {
			            // Save the current group if it exists
			            if (currentGroup) {
			                groupedData.push(currentGroup);
			            }
			            // Start a new group
			            currentGroup = { 
			                type: "text",
			                value: item.value,
			                ts: item.ts,
			                end_ts: item.end_ts
			            };
			        } else {
			            // Append to the current group
			            if (currentGroup) {
			                currentGroup.value += item.value;
			            } else {
			                // In case of no prior timed data
			                throw new Error("Encountered punctuation or text without timing before any valid timed data.");
			            }
			        }
			    });
			
			    // Push the last group if it exists
			    if (currentGroup) {
			        groupedData.push(currentGroup);
			    }
			
			    return groupedData;
			}


			
			
			if(!aud.paused) {
				aud.pause()
				el.textContent = "Play"
				isPlaying = false;
			} else {
				aud.play();
				el.textContent = "Pause"
				isPlaying = true;
			}
		break;
		case  "Add Timesheet": 
			//B"H
			var auth = comment.author;
			
			if(window?.curAlias != auth) {
				alert("You're current alias " + window?.curAlias + 
				      	"is not the author of that comment!")
				return;
			}
			var search = new URLSearchParams(location.search)
			var verseNum = search.get("idx")
			if(!verseNum && verseNum !== 0) {
				verseNum = "root"
			}
			var r = null;
			try {
				r = await  selectAndUpload({
					type: "timesheet",
					heichel: post.heichel.id,
					series: series.id,
					postId: post.id,
					verseNum,
					author: auth
				})
				alert("Did we upload? " + JSON.stringify(r));
			} catch(e) {
				alert("Issue upladoing " + e.stack)
				console.log(e);
				return;
			}
			var a  = await (await 
			        fetch(`/api/social/heichelos/ikar/post/${
				      post.id
				}/comments/`, {
			     method: "PUT",
			      "body": new URLSearchParams({
			        aliasId:window?.curAlias,
			        commentId: comment.id,
			        
			        dayuh: JSON.stringify({
			           
			            timesheet: {
							BH: "Boruch Hashem",
							time: Date.now(),
							...r
				    }
			        })
			      }),
			   
			    })
			).json()
			if(a.message) alert(a.message)
			if(a.error) alert("An erro!" + a.error.message)
		break;
		case  "Add Audio": 
			//B"H
			var auth = comment.author;
			
			if(window?.curAlias != auth) {
				alert("You're current alias " + window?.curAlias + 
				      	"is not the author of that comment!")
				return;
			}
			var search = new URLSearchParams(location.search)
			var verseNum = search.get("idx")
			if(!verseNum && verseNum !== 0) {
				verseNum = "root"
			}
			var r = null;
			try {
				r = await  selectAndUpload({
					type: "audio",
					heichel: post.heichel.id,
					series: series.id,
					postId: post.id,
					verseNum,
					author: auth
				})
				alert("Did we upload? " + JSON.stringify(r));
			} catch(e) {
				alert("Issue upladoing " + e.stack)
				console.log(e);
				return;
			}
			var a  = await (await 
			        fetch(`/api/social/heichelos/ikar/post/${
				      post.id
				}/comments/`, {
			     method: "PUT",
			      "body": new URLSearchParams({
			        aliasId:window?.curAlias,
			        commentId: comment.id,
			        
			        dayuh: JSON.stringify({
			           
			            transcripted: {
					time: Date.now(),
					...r
				    }
			        })
			      }),
			   
			    })
			).json()
			if(a.message) alert(a.message)
			if(a.error) alert("An erro!" + a.error.message)
		break;
		case "Copy":
			try {
				navigator.clipboard.writeText(comment?.content)
			} catch(e) {
				alert("ISsue copying " + e.stack)
				console.log(e)
			}
		break;
	}
	// Define actions for each option: Reply, Copy, Edit, etc.
}

function handleClick(comment) {
	console.log("Comment clicked:", comment);
	// Action for single-click
}

function handleLongClick(comment) {
	console.log("Long-click on comment:", comment);
	// Action for long-click
}

async function countCommentsOfAlias(alias) {
	var subSec = getSubSecIdx();
	var comCount = await getCommentsOfAlias({
		postId: post.id,
		heichelId: post.heichel.id,
		aliasId: alias,
		get: {
			verseSection: currentVerse,
			map: true,
			count: true,
		/*	propertyMap: JSON.stringify({
				//var subSec = getSubSecIdx();
				...(
					subSec || subSec === 0 ? {
						dayuh: {
							subSectionIndex: {
								equals: subSec
							}, 
							
						}
					} : {}
				)
			})*/
				
		}
	});
}



// B"H - Displays all comments from a given alias in the side panel for the current verse.
async function showAllComments({
	alias,
	post,
	tab /*actualTab parent*/,
	withCurrentVerse = true
}) {
	var subSec = getSubSecIdx();
	var coms = await getCommentsOfAlias({
		seriesId: window?.post?.parentSeriesId,
		postId: post.id,
		heichelId: post.heichel.id,
		aliasId: alias,
		fromCache: true, // Use cache for speed on manual clicks
		get: {
			verseSection: currentVerse,
			map: true,
		}
	});

	if (!Array.isArray(coms) || coms.length === 0) {
		tab.innerHTML = "No comments yet from this user on this verse.";
		return;
	}

	tab.innerHTML = ""; // Clear previous content

	var ri = document.createElement("div");
	ri.className = "btn";
	ri.textContent = isAliasInline(alias) ? "Hide inline" : "Read inline";
	ri.onclick = () => {
		toggleInlineForComments(coms, alias);
		ri.textContent = isAliasInline(alias) ? "Hide inline" : "Read inline";
	};
	tab.appendChild(ri);

    // Render every comment fetched for the current verse.
    coms.forEach(c => {
        makeHTMLFromComment({
            comment: c,
            aliasId: alias,
            tab
        });
    });
}

var inlineComments = {}//arrays by alias

// B"H - Renders comments directly into the post body. This is now additive.
function addCommentsInline(comments, alias) {
    
    if (!comments || comments.length === 0) return;
	// --- Group ALL comments by their verse section. This is the key. ---
    const commentsByVerse = comments.reduce((acc, comment) => {
        const verseKey = comment?.dayuh?.verseSection ?? 'root';
        if (!acc[verseKey]) acc[verseKey] = [];
        acc[verseKey].push(comment);
        return acc;
    }, {});

	//

    // --- Process each group independently ---
    for (const verseKey in commentsByVerse) {
        const commentsForThisVerse = commentsByVerse[verseKey];
		
        // Handle "Root" Comments
        if (verseKey === 'root') {
            const rootCommentHolder = createAndPlaceRootCommentHolder(alias);
            if (rootCommentHolder) {
                commentsForThisVerse.forEach(c => {
                    if (!rootCommentHolder.querySelector(`[data-cid='${c.id}']`)) { // Prevent duplicates
                        const incom = makeInlineComment(alias, c);
                        incom.dataset.cid = c.id; // Mark the element with the ID
                        rootCommentHolder.appendChild(incom);
                    }
                });
            }
            continue; // Continue to the next group
        }

        // Handle Verse-Specific Comments
        const targetSectionElement = document.querySelector(`.section[data-idx='${verseKey}']`);
        
		if (!targetSectionElement) continue;
		
        commentsForThisVerse.forEach((c, i) => {
            const subIdx = c?.dayuh?.subSection ?? 'main';
            const parentElement = (subIdx === 'main')
                ? targetSectionElement
                : targetSectionElement.querySelector(`.sub-awtsmoos[data-idx='${subIdx}']`);
            
		
            if (parentElement) {
                let commentHolder = parentElement.querySelector(`.commentator.inline[data-alias='${alias}'][data-idx='${i}'] .comments-holder-inline`);
                if (!commentHolder) {
                    commentHolder = makeInlineCommentHolder(alias, parentElement, i);
                }
				//console.log("lol", verseKey, targetSectionElement, parentElement, commentHolder)
                if (!commentHolder.querySelector(`[data-cid='${c.id}']`)) { // Prevent duplicates
                    const incom = makeInlineComment(alias, c);
                    incom.dataset.cid = c.id; // Mark the element with the ID
                    commentHolder.appendChild(incom);
                }
            }
        });
    }
}

function makeTooltip(msg=null) {
	var toolTip = document.createElement("div")
	toolTip.classList.add("awtsmoosTooltip")
	var icon = document.createElement("div")
	icon.textContent = "i"
	toolTip.appendChild(icon)
	icon.classList.add("tooltipIcon")

	if(msg) {
		var m = document.createElement("div")
		m.textContent = msg
		toolTip.appendChild(m)
		m.classList.add("tooltipContent")
	}
	return toolTip
	
}


function makeInlineCommentHolder(alias, parent, idx
	/*if we're adding mutliple comments
	for same section we need to dstinguish them with idx*/
) {
	var inlineHolder = document.createElement("div")
	inlineHolder.classList.add("commentator","inline");
	inlineHolder.dataset.alias = alias;
	inlineHolder.dataset.idx = idx;
	parent.appendChild(inlineHolder);

	var inHeader = document.createElement("div")
	var a = document.createElement("a")
	a.href = "/@"+alias;
	if(!isFirstCharacterHebrew(alias)) {
		inHeader.classList.add("en")
	}
	
	a.textContent = "@" + alias;
	inHeader.appendChild(a);
	inHeader.classList.add("alias-name");
	inlineHolder.appendChild(inHeader);

	var commentHolder = document.createElement("div")
	
	commentHolder.classList.add("comments-holder-inline");
	inlineHolder.appendChild(commentHolder);
	return commentHolder;
}

function getInlineAliases() {
  var url = new URL(window.location);
  var inlineParam = url.searchParams.get("inline");
  var p = null;
  try {
    p = JSON.parse(inlineParam);
    if(p && Array.isArray(p)) {
      return p;
    } else return []
  } catch(e) {
      return [];
  }
}

function hideCommentsInline(comments, alias) {
	var inl = inlineComments[alias]
	if(inl) {
		inlineComments[alias] = null;
	}
    const url = new URL(window.location);
    var inline = document.querySelectorAll(
        ".commentator.inline[data-alias='" + alias + "']"
    )
    .forEach(w=>w.parentNode.removeChild(w));
  
    var p = getInlineAliases();
    if(!p.length) {
        url.searchParams.delete("inline");
    } else {
        var idx = p.indexOf(alias);
        if(idx > -1) {
            p.splice(idx, 1);
            updateQueryStringParameter("inline", JSON.stringify(p));
        }
    }
    
    loadedInlineVerses = {}; // Reset the memory for this alias
}

function areCommentsInline() {
  var GET = new URLSearchParams(location.search);
  return  GET.get("inline");
}

function isAliasInline(alias) {
	var GET = new URLSearchParams(location.search);
 	var inline = GET.get("inline")
	var p = null;
	try {
		p  = JSON.parse(inline);
		return Array.isArray(p) ?
			p.indexOf(alias) >= 0
			: false
	} catch(e) {}
	return false;
}
function currentCommentsInline() {
  
}

function toggleInlineForComments(comments, alias) {
  var isInline = isAliasInline(alias);
  if(!isInline) {
    addCommentsInline(comments, alias)
    // Add alias to URL
    let p = getInlineAliases();
    if (!p.includes(alias)) {
        p.push(alias);
        updateQueryStringParameter("inline", JSON.stringify(p));
    }
  } else {
    hideCommentsInline(comments, alias)
  }
}

function curVerse() {
	var p = new URLSearchParams(location.search);
	return p.get("idx")
}

async function openCommentsOfAlias({
	alias, actualTab, post, mainParent,
	all=false
}) {

	var commentors = actualTab.querySelector(".commentors")
	if(commentors) actualTab = commentors;
	
	await showAllComments({
		tab: actualTab,
		post,
		alias,
		withCurrentVerse: !all
	});
	var ld = actualTab.querySelector(".loading")
	if(ld) ld.parentNode.removeChild(ld)
}

async function updateCommentHeader() {
	
	var aliases = await getAndSaveAliases()
	var curVerseDisplay = currentVerse === "root" ? "Post" : +currentVerse + 1;
	
	window?.tabComment?.onUpdateHeader(
		(aliases.length) + " Commentators for verse: "
		+ (curVerseDisplay)
	)
}


/*B"H*/
/**
 * The Master Conductor for all dynamic comment updates triggered by scrolling.
 * This function is the single source of truth for synchronizing the comment panel
 * and inline comments with the currently viewed verse.
 *
 * It works by:
 * 1. Capturing the current state (which alias tab is open).
 * 2. Invalidating all data caches for the new verse.
 * 3. Rebuilding the commentator list for the new verse's data.
 * 4. Finding the new tab corresponding to the previously opened alias.
 * 5. Programmatically opening that new tab to trigger a fresh render of its comments.
 * 6. Updating any inline comments.
 */
async function indexSwitch() {
    // Determine the verse we are scrolling TO.
    var idxNum = getIdx();
    var newVerse = (!idxNum && idxNum !== 0) ? "root" : idxNum;
	
    // Performance Guard: Do nothing if the verse hasn't actually changed.
    if (currentVerse === newVerse) {
        return;
    }
	
    
    // --- STEP 1: CAPTURE CURRENT STATE & UPDATE CACHE ---
    // Capture which alias tab is open BEFORE we rebuild the UI.
    const tabHeader = window.curTab?.awtsHeader?.textContent?.trim().substring(1);
    
    // Set the new global verse state.
    currentVerse = newVerse;
    
    // Invalidate all data caches to force a fresh fetch.
   // invalidateVerseCache(newVerse);
	if(curTab?.awtsmoosType ==  "main commentator list") {
		/*
			as we scroll we need to see how many
			people have commented on that section.
		*/
		
		await makeCommentatorList(tabParent, rootLevelCommentatorTab);

		
	}

	if(curTab?.awtsmoosType == "specific alias comments") {
		if(currentAliasTabContainer)
			openCommentsOfAlias({
				alias: currentAliasBeingViewed,
				actualTab: currentAliasTabContainer,
				post,
			});
		
	}
	await updateCommentHeader();
	

    // --- STEP 3: SYNCHRONIZE INLINE COMMENTS (IF ACTIVE) ---
    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        const commentators = await getAndSaveAliases(true);
		
		//console.log("liners",inlineAliases,commentators)
        for (const aliasId of commentators) {
           
            // Skip if this alias isn't set to be read inline.
            if (!inlineAliases.includes(aliasId)) continue;

            // Skip if we've already loaded this alias for this verse.
            const cacheKey = `${aliasId}-${newVerse}`;
            if (loadedInlineVerses[cacheKey]) continue;

            // Fetch and render the comments.
            const comments = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId,
                postId: window?.post?.id,
                heichelId: window?.post?.heichel.id,
                aliasId: aliasId,
                get: { verseSection: newVerse, map: true }
            });

            addCommentsInline(comments, aliasId);
            // Mark as loaded to prevent re-rendering.
            loadedInlineVerses[cacheKey] = true;
        }
    }

	
}

// B"H - This is the unified rendering engine for displaying comment content.
function populateCommentElement(comment, parentElement) {
    parentElement.innerHTML = ''; // Start with a clean slate.

    // --- Step 1: Data Normalization ---
    let normalizedComment = JSON.parse(JSON.stringify(comment));

    if (normalizedComment?.content?.title) {
        normalizedComment.dayuh.title = normalizedComment.content.title;
    }
    if (Array.isArray(normalizedComment?.content?.text)) {
        normalizedComment.content = normalizedComment.content.text;
    }
    if (Array.isArray(normalizedComment.content)) {
        if (!Array.isArray(normalizedComment.dayuh.sections)) {
            normalizedComment.dayuh.sections = [];
        }
        normalizedComment.dayuh.sections.push(...normalizedComment.content);
        normalizedComment.content = null; // Nullify after moving
    }

    // --- Step 2: Render from the normalized object ---

    if (normalizedComment?.dayuh?.title && typeof normalizedComment.dayuh.title === 'string') {
        parentElement.appendChild(makeTitleDiv(normalizedComment.dayuh.title));
    }

    if (normalizedComment.content && typeof normalizedComment.content === 'string') {
        const textDiv = document.createElement("div");
        textDiv.innerHTML = markdownToHtml(sanitizeComment(normalizedComment.content));
        parentElement.appendChild(textDiv);
    }
    
    if (Array.isArray(normalizedComment.dayuh?.sections)) {
        normalizedComment.dayuh.sections.forEach(sectionData => {
            const txt = sectionData?.text || (typeof sectionData === 'string' ? sectionData : "");
            const sectionTitle = sectionData?.title;
            if (!txt && !sectionTitle) return;

            const sec = document.createElement("div");
            sec.className = "awtsmoos-comment-section";
            if (sectionTitle && typeof sectionTitle === 'string') {
                sec.appendChild(makeTitleDiv(sectionTitle));
            }
            if (txt) {
                const textDiv = document.createElement('div');
                textDiv.innerHTML = markdownToHtml(sanitizeComment(txt));
                sec.appendChild(textDiv);
            }
            parentElement.appendChild(sec);
        });
    }

    addImageGallery(normalizedComment?.dayuh?.images, parentElement);

    // --- Step 3: Set Language Direction Safely ---
    const topLevelContainer = parentElement.closest('.comment-content, .inline-comment');
    if (topLevelContainer) {
        topLevelContainer.classList.remove("heb", "en");
        if (isFirstCharacterHebrew(parentElement.innerText)) {
            topLevelContainer.classList.add("heb");
        } else {
            topLevelContainer.classList.add("en");
        }
    }
}

function getSubIdx() {
	var s = new URLSearchParams(location.search)
	var idx = s.get("sub")
	if(idx === null) return null;
	idx = parseInt(idx)
	return idx 
}
function getIdx() {
	var s = new URLSearchParams(location.search)
	var idx = s.get("idx")
	if(idx === null) return null;
	idx = parseInt(idx)
	return idx;
}


function getSubSecIdx() {
	var s = new URLSearchParams(location.search)
	var idx = s.get("sub")
	if(idx === null) return null;
	idx = parseInt(idx)
	return idx;
}

async function reloadRoot() {
    var verseSection = getIdx() ?? "root";
    invalidateVerseCache(verseSection);
    // After invalidating, just call the conductor. It will handle the rest.
    await indexSwitch();
}
window.reloadRoot = reloadRoot;

// Creates and places the container for root-level comments right after the post title.
function createAndPlaceRootCommentHolder(alias) {
    const postContent = document.getElementById("realPost");
    if (!postContent) return null;

    let inlineHolder = postContent.querySelector(".commentator.inline.root-comments-holder[data-alias='" + alias + "']");
    if (inlineHolder) {
        return inlineHolder.querySelector(".comments-holder-inline");
    }

    inlineHolder = document.createElement("div");
    inlineHolder.className = "commentator inline root-comments-holder";
    inlineHolder.dataset.alias = alias;

    var inHeader = document.createElement("div");
    inHeader.classList.add("alias-name");
    var a = document.createElement("a");
    a.href = "/@" + alias;
    if (!isFirstCharacterHebrew(alias)) {
        inHeader.classList.add("en");
    }
    a.textContent = "@" + alias;
    inHeader.appendChild(a);
    inlineHolder.appendChild(inHeader);

    var commentHolder = document.createElement("div");
    commentHolder.classList.add("comments-holder-inline");
    inlineHolder.appendChild(commentHolder);

    const postTitle = postContent.querySelector(".post-title");
    if (postTitle && postTitle.nextSibling) {
        postTitle.parentNode.insertBefore(inlineHolder, postTitle.nextSibling);
    } else if (postTitle) {
        postTitle.parentNode.appendChild(inlineHolder);
    } else {
        postContent.prepend(inlineHolder);
    }

    return commentHolder;
}

function getPostId(currentVerse) {
	var sectionInfo = window?.sectionData[currentVerse];
	var commentPost = post.id;
	var sp = sectionInfo?.referenceInfo?.postId
	if(sp) {
		commentPost = sp;
	}
	return commentPost
}
function getSeriesId(currentVerse) {
	var sectionInfo = window?.sectionData[currentVerse];
	var commentPost = window?.series?.id
	var sp = sectionInfo?.referenceInfo?.sourceSeries
	if(sp) {
		commentPost = sp;
	}
	return commentPost
}

function openPanel() {
	
	var hid = document.querySelector(".hidden-comments")
	if(hid) hid.classList.remove("hidden-comments")
	var cb = document.getElementById("commentaryBtn");
	if(cb) {
		cb.classList.add("pushed");
	}
}

async function openPanelToComments() {
    // reloadRoot now correctly triggers the UI build via indexSwitch
	await reloadRoot(); 
	window?.commentTab?.open();
	openPanel();
}
window.openPanelToComments=openPanelToComments;
window.openPanel = openPanel;
async function openCommentsPanelToAlias(alias, open=true) {
    // This function now works more reliably because reloadRoot is fixed
	await reloadRoot(); 
	var tabs = window.tabManager.getTabs(); // Assuming TabManager has a method to get all tabs
    var tab = tabs.find(q =>
		q.awtsHeader.textContent.trim().substring(1) == alias
	);

	if(!tab) return null;
	tab?.open();
	if(open) {
		openPanel();
	}
	return tab;
}
async function showAllInlineComments() {
	var inlines = getInlineAliases();
	if(inlines.length == 0) return;

    // We still call reloadRoot which will call indexSwitch, which handles inline comments.
	await reloadRoot(); 
}
window.showAllInlineComments = showAllInlineComments;
window.openCommentsPanelToAlias = openCommentsPanelToAlias;

/*B"H*/
/**
 * Initializes the comment section by rendering the list of commentator buttons.
 * @param {object} params - The initialization parameters.
 * @param {HTMLElement} params.parent - The specific container for the comment UI.
 * @param {object} params.tab - The main comment tab object.
 */
async function loadRootComments({ parent, tab }) {
	// 1. Set up the global tab reference
	window.tabComment = tab;
	
	// 2. Determine the initial verse state.
	var idx = getIdx();
	currentVerse = (idx === null) ? "root" : idx;
//	console.log(`[Comments] Initializing for verse: ${currentVerse}.`);

   
	// 4. Render the initial UI directly into the provided container.
	if (!parent) {
		return console.error("Comment container is null! Cannot render.");
	}

	window.tabParent = parent;
	window.rootLevelCommentatorTab = tab;
	parent.innerHTML = "";
	await updateCommentHeader();
	await makeCommentatorList(tabParent, rootLevelCommentatorTab);
}

/**
 * The data engine for the side panel. It fetches and caches the master list of 
 * all commentators for a given verse.
 */
async function getAndSaveAliases(full = false, forceFresh = false) {
    
    // Guard clause to prevent errors on initial load
    if (!window.post || !window.post.heichel) {
        console.warn("[Guard] getAndSaveAliases called before window.post.heichel was ready. Returning empty list.");
        return [];
    }
    
    var verseSection = getIdx() ?? "root";

    if (!data.aliases) data.aliases = {};

    if (!forceFresh && data.aliases[verseSection]) {
        const cachedData = data.aliases[verseSection].aliases;
        if (Array.isArray(cachedData)) {
            return full ? cachedData : cachedData.map(w => w?.id || w);
        }
    }

    var aliases = [];
    try {
        const result = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId,
            postId: window.post.id,
            heichelId: window.post.heichel.id,
            fromCache: false,
            get: { verseSection, map: true }
        });

        if (Array.isArray(result)) {
            aliases = result;
        }
    } catch (error) {
        console.error(`[Data Integrity] Critical error fetching commentator list for verse ${verseSection}:`, error);
    }

    data.aliases[verseSection] = { aliases, lastModified: Date.now() };

    return full ? aliases : aliases.map(w => w?.id || w);
}

function makeAddCommentSection(par) {
	var div = document.createElement("div")
	div.classList.add("comment-section")
	par.appendChild(div);
	var c = new CommentSection(div);
}
/*B"H*/
/**
 * Renders the side panel's list of commentator buttons.
 * It now correctly captures the content area of the specific alias tab that is opened.
 * @param {HTMLElement} actualTab - The container element to render the UI into.
 * @param {object} tab - The parent tab object.
 * @returns {Promise<Array>} A promise that resolves to an array of the created tab objects.
 */
async function makeCommentatorList(actualTab, tab) {
    actualTab.innerHTML = "";
    makeAddCommentSection(actualTab);

    var commentorList = document.createElement("div");
    commentorList.classList.add("commentors");
    actualTab.appendChild(commentorList);
    
    var aliases = await getAndSaveAliases();
    curTab = tab;
	window.curTab = curTab;
	curTab.awtsmoosType = "main commentator list";
	
    if (!aliases || !Array.isArray(aliases) || aliases.length === 0) {
        commentorList.innerHTML = "Be the first to comment on this verse!";
        return [];
    }


    var tabs = [];
    aliases.forEach(alias => {
        var newTab = addTab({
            header: "@" + alias,
            btnParent: commentorList,
			parent: mainParent, // Should be the holder for all tab contents
			tabParent: tab,
			content: loadingHTML,
			async onopen({ actualTab: aliasContentArea }) { 
				
				curTab = newTab;
				window.curTab = curTab;
				curTab.awtsmoosType = "specific alias comments";
			
				window.currentAliasTabContainer = aliasContentArea; 
				window.currentAliasBeingViewed = alias;
				openCommentsOfAlias({
					alias: currentAliasBeingViewed,
					actualTab: currentAliasTabContainer,
					post,
				});
			},
			async onclose() {
				console.log("WHAT are we even?")
				// When an alias tab is closed, clear the reference.
				window.currentAliasTabContainer = null;
				await makeCommentatorList(tabParent, rootLevelCommentatorTab);
			}
        });
        tabs.push(newTab);
    });
    return tabs;
}
async function selectAndUpload({heichel, series, postId, verseNum, author, type="audio"}) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    const filePromise = new Promise((resolve, reject) => {
        fileInput.addEventListener("change", event => {
            const file = event.target.files[0];
            if (file) resolve(file);
            else reject(new Error("No file selected"));
        });
    });

    fileInput.click();

    try {
        const file = await filePromise;
        const url = URL.createObjectURL(file);
        const result = await uploadBlobToS3(url, heichel, series, postId, verseNum, author, 
					    type=="audio"?"koyl.mp3" : 
					    type=="timesheet" ? "timesheet.json":null
					);
        URL.revokeObjectURL(url);
        return result;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}
async function uploadBlobToS3(url, heichel, series, postId, verseNum, author, fileName) {
	if(!fileName) return alert("incorrect filename ")
    const storageKey = "awsCredentials";
    let awsConfig = JSON.parse(localStorage.getItem(storageKey));
    const requiredKeys = ["accessKeyId", "secretAccessKey", "accountId", "bucket"];

    if (!awsConfig || !requiredKeys.every(key => awsConfig[key])) {
        awsConfig = {};
        requiredKeys.forEach(key => {
            const value = window.prompt(`Enter ${key}:`);
            if (!value) throw new Error(`Missing value for ${key}`);
            awsConfig[key] = value;
        });
        localStorage.setItem(storageKey, JSON.stringify(awsConfig));
    }

    const blob = await (await fetch(url)).blob();
    const arr = await blob.arrayBuffer();
    const int = new Uint8Array(arr);

    const key = `heichelos/${heichel}/series/${series}/postId/${postId}/verse/${verseNum}/${author}/${fileName}`;

    const result = await sendIt({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        accountId: awsConfig.accountId,
        bucket: awsConfig.bucket,
        key: key,
        content: int
    });

    return { bucket: awsConfig.bucket, path: key };
}
async function init({
	post,
	mainParent,
	parent/*container for comments*/,
	rootTab,
	tab
}) {
	window.post=post;
	window.rootTab=rootTab;
	window.mainParent=mainParent;
	window.parent = parent;
	window.tabComment = tab;
	await showAllInlineComments();
}

/**
 * Orchestrates the entire UI update after a user posts a new comment.
 */
async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    console.log(`[Finale] Orchestrating UI for new comment ${commentId} by ${aliasId}`);
    
    invalidateVerseCache(verseSection);

    if (isAliasInline(aliasId) && newCommentData) {
        const memoryKey = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[memoryKey];
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[memoryKey] = true;
    }
    
    // reloadRoot is the correct way to refresh the panel now.
    await reloadRoot(); 
    const aliasTab = await openCommentsPanelToAlias(aliasId, true);
    if (aliasTab && commentId) {
        setTimeout(() => {
            const newEl = aliasTab.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if (newEl) {
                newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newEl.classList.add('highlight-new-comment');
                setTimeout(() => newEl.classList.remove('highlight-new-comment'), 2500);
            }
        }, 300);
    }
}


// Update your exports
export {
	init,
	loadRootComments,
	indexSwitch
}

// Expose ONLY the high-level functions needed by other modules
window.commentLogic = {
    handleNewComment
};


// 3. Set up the scroll listener for future updates.
removeEventListener("awtsmoos index", indexSwitch);
addEventListener("awtsmoos index" , indexSwitch);