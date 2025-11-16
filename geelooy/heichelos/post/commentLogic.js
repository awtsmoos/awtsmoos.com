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
    console.log(`[Cache] Invalidating ALL caches for verseSection: ${verseSection}`);

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
async function makeHTMLFromComment({
	comment,
	aliasId,
	tab
}) {
	

	// Create main comment container
	var cmCont = document.createElement("div");
	cmCont.className = "comment-content";
	cmCont.dataset.cid = comment.id;
	tab.appendChild(cmCont);

	function forEachTxt(content, title="", section=false) {
		// Add the comment text
		var commentTitle = null;
		if(title) {
			
			commentTitle = makeTitleDiv(title)
			cmCont.appendChild(commentTitle);
		}
		
		var commentText = document.createElement("div");
		commentText.className = "comment-text"+ (section?" section" : "");
		if(content)
			commentText.innerHTML = markdownToHtml(sanitizeComment(content||""));
		else {
			console.log("No content?",content,title)
		}
		if(!isFirstCharacterHebrew(content)) {
			cmCont.classList.add("en")
		} else {
			cmCont.classList.add('heb')
		}
		cmCont.appendChild(commentText);
	}
	if(comment?.content?.title) {
		comment.dayuh.title = comment?.content?.title;
		comment.content = comment.content.text;
		
	}
	if(Array.isArray(comment?.content?.text)) {
		comment.content = comment.content.text;
	}
	if(comment?.dayuh?.title) {
		var commentTitle = makeTitleDiv(comment?.dayuh?.title)
		cmCont.appendChild(commentTitle);
	}
	if(Array.isArray(comment.content)) {
		comment.dayuh.sections = comment.content;
		comment.content = null;
	}
	if(comment.content) {
		forEachTxt(comment.content)
	}
	if(Array.isArray(comment.dayuh.sections)) {
		comment.dayuh.sections.forEach(s => {
			forEachTxt(s?.text || s,s.title,true);
		})
		
	}

	// Display images if available
	var d = comment?.dayuh;
	const images = d?.images;
	
	addImageGallery(images,cmCont);
	// Optional sections
	
	/*var sc = d ? d.sections : null;
	if (sc) sc.forEach(q => {
		var cs = document.createElement("div");
		cs.className = "comment-section";
		cs.innerHTML = markdownToHtml(sanitizeComment(q));
		cmCont.appendChild(cs);
	});*/

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
		// Create the audio element
		var audio = document.createElement("audio");
		audio.controls = true; // Adds play, pause, volume controls
		audio.src = `https://${bucket}.awtsmoos.com/${path}`;
		audio.style.display = "none"; // Initially hidden
		audio.dataset.awtsmoosAudio = comment.id
		// Append the audio player to the DOM
		cmCont.appendChild(audio);
	
	
	}
	opts.forEach(option => {
		var menuItem = document.createElement("div");
		menuItem.className = "menu-item";
		menuItem.innerText = option;
		menuItem.onclick = () => handleMenuOption(option, comment, menuItem); // Call a function for each option
		menuOptions.appendChild(menuItem);
	});

	// Toggle the menu when clicking the three dots
	menuButton.onclick = (e) => {
		e.stopPropagation(); // Prevent other click handlers from triggering
		menuOptions.style.display = menuOptions.style.display === "none" ? "block" : "none";
	};

	// Close menu when clicking outside
	document.addEventListener("click", (e) => {
		if (!menuContainer.contains(e.target)) {
			menuOptions.style.display = "none";
		}
	});
/*
	// Handle single-click and long-click on the comment text
	let clickTimeout;
	commentText.onmousedown = (e) => {
		clickTimeout = setTimeout(() => {
			// Long-click action
			handleLongClick(comment);
		}, 500); // Long-click delay (500ms)
	};

	commentText.onmouseup = (e) => {
		clearTimeout(clickTimeout); // Cancel long-click if released early
		// Single-click action
		handleClick(comment);
	};*/

	

	return comment;
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
		fromCache: true,
		get: {
			verseSection: currentVerse,
			map: true,
			/*propertyMap: JSON.stringify({
				content: true,
				author: true,
				dayuh: {
					verseSection: true,
					sections: true,
					images: true,
					title: true,
					...(
						subSec || subSec === 0 ? {	
							subSectionIndex: {
								equals: subSec
							},
						
							
						} : {}
					)
				}
			})*/
				
		}
	});
	if(Array.isArray(coms)) {
	  coms = coms.reverse()
      
    
	} else {
		return console.log("No comments")
	}
	if(coms.length == 0) {
		tab.innerHTML = "No comments yet from this user";
		return
	}
	tab.innerHTML = "";
	var ri = document. createElement("div")
	ri.className = "btn"
	//
	var comments= []
	console. log("got", window.j=comments)

	ri. textContent = "read inline"
	ri. onclick = ()=>{
		
		toggleInlineForComments(
			comments, alias  
		);
		if(isAliasInline(alias)) {
			ri.textContent = "Hide inline";
		
		} else {
			ri.textContent = "Read inline";
		}
		

	}
	tab.innerHTML = loadingHTML;
	

	
	for(var comment of coms) {
		//var postId = getPostId(currentVerse)
		/*
		var comment = await getComment({
			heichelId: post.heichel.id,
			commentId:w,
			postId,
			seriesId: getSeriesId(currentVerse),
			aliasId: alias,
			parentType: "post",
			parentId: postId,
		});
		comment.id = w;*/
		
	//	if(comment?.content?.trim() || comment?.dayuh?.images?.length)
			comments.push(comment);
		
	}
	
	tab.innerHTML = "";
	tab.appendChild(ri);
	comments = comments.reverse()
	for(var c of comments) {
		var com= await makeHTMLFromComment({
			comment: c,
			aliasId: alias,
			
			tab
		})
	}

	
  if(isAliasInline(alias)) {
    ri.textContent = "Hide inline";
    
  } else {
    ri.textContent = "Read inline";
  }
}

var inlineComments = {}//arrays by alias

// B"H - REWRITTEN AND CORRECTED FUNCTION
function addCommentsInline(comments, alias) {
    console.log(`[Inline Render] Attempting to render ${comments.length} inline comments for alias: ${alias}`);

    if (!comments || comments.length === 0) {
        return; // Nothing to do.
    }

    // All comments passed in are for the same verse. Determine which one.
    const verseSection = comments[0]?.dayuh?.verseSection;

    // --- Handle Root Comments (comments on the post as a whole) ---
    if (verseSection === undefined || verseSection === null) {
        const rootCommentHolder = createAndPlaceRootCommentHolder(alias);
        if (rootCommentHolder) {
            comments.forEach(c => {
                if (!inlineComments[alias]) inlineComments[alias] = [];
                if (!inlineComments[alias].find(w => w.id === c.id)) {
                    inlineComments[alias].push(c);
                    const incom = makeInlineComment(alias, c);
                    rootCommentHolder.appendChild(incom);
                }
            });
        }
        return; // Finished with root comments
    }

    // --- Handle Verse-Specific Comments ---
    const targetSectionElement = document.querySelector(`.section[data-idx='${verseSection}']`);
    if (!targetSectionElement) {
        console.error(`[Inline Render] Could not find target section element for verseSection: ${verseSection}`);
        return;
    }

    // Group comments by their sub-section index for efficient processing
    const commentsBySubSection = comments.reduce((acc, comment) => {
        const subIdx = comment?.dayuh?.subSectionIndex ?? 'main';
        if (!acc[subIdx]) {
            acc[subIdx] = [];
        }
        acc[subIdx].push(comment);
        return acc;
    }, {});

    // Process each group of comments (main verse and any sub-sections)
    for (const subSectionKey in commentsBySubSection) {
        let parentElementForComments;
        let commentHolder;

        if (subSectionKey === 'main') {
            parentElementForComments = targetSectionElement;
        } else {
            parentElementForComments = targetSectionElement.querySelector(`.sub-awtsmoos[data-idx='${subSectionKey}']`);
        }

        if (parentElementForComments) {
            // Find or create the main container for this alias's comments
            commentHolder = parentElementForComments.querySelector(`.commentator.inline[data-alias='${alias}'] .comments-holder-inline`);
            if (!commentHolder) {
                commentHolder = makeInlineCommentHolder(alias, parentElementForComments);
            }
            
            // Append the actual comments
            commentsBySubSection[subSectionKey].forEach(c => {
                if (!inlineComments[alias]) inlineComments[alias] = [];
                if (!inlineComments[alias].find(w => w.id === c.id)) {
                    inlineComments[alias].push(c);
                    const incom = makeInlineComment(alias, c);
                    commentHolder.appendChild(incom);
                }
            });
        } else {
            console.warn(`[Inline Render] Could not find parent element for sub-section key: ${subSectionKey} in verse ${verseSection}`);
        }
    }
    
    // Ensure alias is marked as inline in the URL
    var p = getInlineAliases();
    if (!p.includes(alias)) {
      p.push(alias);
    }
    if (p.length) {
        updateQueryStringParameter("inline", JSON.stringify(p));
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

function makeInlineComment(alias, comment) {
	var content = comment.content
	var incom= document
	.createElement("div")
	
	
	incom.className="inline-comment"
	//var hdr = document.createElement("")
	if(
		comment?.dayuh?.verseSection && !
		comment?.dayuh?.hideVerseNumber
	) {
		var num = document.createElement("div");
		num.textContent = comment?.dayuh?.verseSection;
		num.classList = "awtsmoos-number";

	}
	//commentHolder.appendChild(incom);
	var comContent = document.createElement("div")
	if(comment.dayuh?.title) {
		var t = makeTitleDiv(comment?.dayuh?.title);
		comContent.appendChild(t);
	}
	if(content) {
		if(!isFirstCharacterHebrew(content)) {
			incom.classList.add("en")
		}
		comContent.innerHTML += markdownToHtml(content||"");
	}
	if(comment?.dayuh?.sections) {
		comment?.dayuh?.sections.forEach(q => {
			var txt = q?.text || q || "";
			if(!txt) return;
			var sec = document.createElement("div");
			sec.className ="awtsmoos-comment-section";
			

			if(isFirstCharacterHebrew(txt)) {
				sec.classList.add("heb")
			}
			sec.innerHTML = markdownToHtml(txt)
			comContent.appendChild(sec)
		})
	}
	var tool = makeTooltip("Open Comment");
	tool.addEventListener("click", async () => {
		console.log("Trying",alias)
		var c = await openCommentsPanelToAlias(alias)
		if(!c) return console.log("Strange",c,alias,comment);
		var con = c.querySelector(`.comment-content[data-cid="${
			comment.id
		}"]`);
		if(con) {
			console.log("Doing",window.con = con,window.comm = comment);
			con?.scrollIntoView();
		} else {
			
			console.log("Didn't get",c,comment,window.c=c,window.comment=comment)
		}
	})
	incom.appendChild(tool);
	incom.appendChild(comContent);
	var images = comment?.dayuh?.images;
	addImageGallery(images,incom);
	
	return incom;
}
function makeInlineCommentHolder(alias, parent) {
	var inlineHolder = document.createElement("div")
	inlineHolder.classList.add("commentator","inline");
	inlineHolder.dataset.alias = alias;
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

// B"H - REVISED FUNCTION WITH AUTOMATIC SCROLLING
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
    
    loadedInlineVerses = {};

    // B"H: Automatic scrolling logic after hiding comments.
    
    
    // First, determine which verse section these comments belonged to.
    if (comments && comments.length > 0) {
        const verseSection = comments[0]?.dayuh?.verseSection;
        let targetElement = null;

        if (verseSection === undefined || verseSection === null) {
            // If it was a root comment, our target is the first real verse section.
            targetElement = document.querySelector(".section[data-idx='0']");
        } else {
            // If it was a numbered verse, our target is that same verse section.
            targetElement = document.querySelector(`.section[data-idx='${verseSection}']`);
        }

        // If we found a logical target, scroll to it smoothly.
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
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
	console.log("GOT",commentors)
	if(commentors) actualTab = commentors;
	var parTab = actualTab;

	var hasSections = Array.isArray(post?.dayuh?.sections);
	await showAllComments({
		tab: actualTab,
		post,
		alias,
		withCurrentVerse: !all
	});
	var ld = actualTab.querySelector(".loading")
	console.log("LOADIN",ld)
	if(ld) ld.parentNode.removeChild(ld)

	return;
   
   
	
    
  }
/*
function getIdx() {
	var sp = new URLSearchParams(location.search);
	
	var idxNum  = sp.get("idx");
	return idxNum
}*/
async function updateCommentHeader() {
	
	var aliases = await getAndSaveAliases()
	console.log("Updating",aliases);
	var curVerseDisplay = +currentVerse;
	var data = window?.sectionData[currentVerse];
	if(
		data && 
		data.hasVerseNumber &&
		data.verseSection !=
		data.sectionId
	) {
		curVerseDisplay++;
	}
	window?.tabComment?.onUpdateHeader(
		(aliases.length) + " Commentators for verse: "
		+ (curVerseDisplay)
	)
}

// B"H



/**
 * The Master Conductor that runs on every scroll. It discovers the true state
 * of the new verse and synchronizes all UI components to match it.
 */
async function indexSwitch() {
    var idxNum = getIdx();
    var newVerse = (!idxNum && idxNum !== 0) ? "root" : idxNum;

    if (currentVerse === newVerse) return; // Performance guard
    
    console.log(`[Conductor] Verse changed to ${newVerse}. Starting synchronization.`);
    currentVerse = newVerse;
    
    // --- 1. DISCOVERY PHASE ---
    // Establish the Single Source of Truth for the new verse.
    await getAndSaveAliases(false, true); // `true` forces a fresh fetch.

    // --- 2. SYNCHRONIZATION PHASE ---

    // A) Synchronize Side Panel UI
    if (window.commentTab && window.commentTab.isOpen) {
        console.log("[Sync] Panel is open. Rebuilding commentator list.");
        await makeCommentatorList(parent, tabComment);
        curTab?.awtsRefresh?.(); 
    }

    // B) Synchronize Inline View UI (Additive)
    const inlineAliases = getInlineAliases();
    if (inlineAliases.length > 0) {
        const masterList = (data.aliases[newVerse]?.aliases || []).map(w => w.id);
        const relevantAliases = masterList.filter(alias => inlineAliases.includes(alias));

        for (const alias of relevantAliases) {
            const memoryKey = `${alias}-${newVerse}`;
            if (loadedInlineVerses[memoryKey]) continue;

            console.log(`[Sync] Rendering inline comments for relevant alias: ${alias}`);
            const comments = await getCommentsOfAlias({
                seriesId: window?.post?.parentSeriesId,
                postId: window?.post?.id,
                heichelId: window?.post?.heichel.id,
                aliasId: alias,
                fromCache: true, 
                get: { verseSection: newVerse, map: true }
            });

            addCommentsInline(comments, alias);
            loadedInlineVerses[memoryKey] = true;
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
// B"H
// FILE: /Remember/awtsmoos.com/geelooy/heichelos/post/commentLogic.js

// ...

// --- REPLACED & REFINED: The Master Refresh Function ---
async function reloadRoot() {
    var verseSection = getIdx();
    verseSection = (verseSection === null) ? "root" : verseSection;

    // Use our new reliable function to ensure all caches are cleared before reloading the UI.
    invalidateVerseCache(verseSection);

    // This will now call loadRootComments, which will in turn call getAndSaveAliases.
    // Since the cache is empty, it will be forced to fetch a fresh list of commentators.
	return await loadRootComments({
		post, 
		mainParent, 
		parent, 
		rootTab,
		tab: tabComment
	});
}


window.reloadRoot = reloadRoot;




// B"H
// This creates and places the container for root-level comments right after the post title.

function createAndPlaceRootCommentHolder(alias) {
    const postContent = document.getElementById("realPost");
    if (!postContent) return null;

    // Check if a holder for this alias already exists at the root level
    let inlineHolder = postContent.querySelector(".commentator.inline.root-comments-holder[data-alias='" + alias + "']");
    if (inlineHolder) {
        return inlineHolder.querySelector(".comments-holder-inline");
    }

    // Create the entire holder from scratch
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

    // --- CRUCIAL PLACEMENT LOGIC ---
    // Use the reliable ".post-title" as the anchor for insertion.
    const postTitle = postContent.querySelector(".post-title");
    if (postTitle && postTitle.nextSibling) {
        // Insert the holder after the title, before the next element.
        postTitle.parentNode.insertBefore(inlineHolder, postTitle.nextSibling);
    } else if (postTitle) {
        // If title is the last element, just append to its parent.
        postTitle.parentNode.appendChild(inlineHolder);
    } else {
        // Fallback: If no title, prepend to the very beginning of the post content.
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
//window.series.id

function openPanel() {
	
	var hid = document.querySelector(".hidden-comments")
	if(hid) hid.classList.remove("hidden-comments")
	var cb = document.getElementById("commentaryBtn");
	if(cb) {
		cb.classList.add("pushed");
	}
}

async function openPanelToComments() {
	var tabs = await reloadRoot();
	console.log(window.tabs=tabs);
	window?.commentTab?.open()
	openPanel();
}
window.openPanelToComments=openPanelToComments;
window.openPanel = openPanel;
async function openCommentsPanelToAlias(alias, open=true) {
	var tabs = await reloadRoot();
	var tab = tabs.find(q=>
		q.awtsHeader.textContent.trim().substring(1) == alias
	);
	if(!tab) return null;
	tab?.open();
	if(open) {
		openPanel()
	}
	return tab;
}
async function showAllInlineComments() {
	var inlines = getInlineAliases();
	if(inlines.length == 0) return;
	var tabs = await reloadRoot();
	tabs.forEach(q => {
		inlines.forEach(inl => {
			var hd = q
				.awtsHeader
				.textContent.substring(1).trim();
			if(inl?.includes(hd)) {
				q.open();
			}
		})
	});
	return tabs;
}
window.showAllInlineComments = showAllInlineComments;
window.openCommentsPanelToAlias = openCommentsPanelToAlias;
async function loadRootComments({
	post,
	mainParent,
	parent/*container for comments*/,
	rootTab,
	tab
}) {
	var idx = getIdx();
	currentVerse = idx;
	removeEventListener("awtsmoos index", indexSwitch);
	addEventListener("awtsmoos index" , indexSwitch);
	
	window.post=post;
	window.rootTab=rootTab;
	window.mainParent=mainParent;
	window.parent = parent;
	window.tabComment = tab;
	
	//window.commentTab = tab;
	
	curTab="root";
	var cm = parent
	if (!cm) {
		return console.log("Comments need parent el")
	}
	cm.innerHTML ="";
	
	await updateCommentHeader();
	//await indexSwitch();
	makeAddCommentSection(cm);
	return await makeCommentatorList(cm, tab);
	
	

	
	
	
}

/**
 * The data engine for the side panel. It fetches and caches the master list of 
 * all commentators for a given verse. This version is hardened with a guard
 * clause to prevent crashes during initial page load.
 */
async function getAndSaveAliases(full = false, forceFresh = false) {
    
    // This is the entire fix. Before doing anything, we check if the necessary
    // global `post` object and its nested `heichel` property are ready.
    if (!window.post || !window.post.heichel) {
        // If they are not ready, it's too early to make the API call.
        // We stop immediately and return an empty array to prevent a crash.
        console.warn("[Guard] getAndSaveAliases called before window.post.heichel was ready. Returning empty list.");
        return [];
    }
    // -----

    var verseSection = getIdx();
    if (!verseSection && verseSection !== 0) verseSection = "root";

    if (!data.aliases) data.aliases = {};

    if (!forceFresh && data.aliases[verseSection]) {
        const cachedData = data.aliases[verseSection].aliases;
        if (Array.isArray(cachedData)) {
            return full ? cachedData : cachedData.map(w => w?.id || w);
        }
    }

    var aliases = []; // Default to an empty array for safety.
    try {
        const result = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId,
            postId: window.post.id,
            heichelId: window.post.heichel.id, // This is now safe to access.
            fromCache: false,
            get: { verseSection, map: true }
        });

        if (Array.isArray(result)) {
            aliases = result;
        } else {
            console.warn(`[Data Integrity] getCommentsByAlias returned a non-array for verse ${verseSection}. Defaulting to empty.`);
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
/**
 * Renders the side panel's list of commentator buttons. It is now a "slave"
 * to the `data.aliases` cache, which is our Source of Truth. It no longer
 * fetches its own data.
 */
async function makeCommentatorList(actualTab, tab) {
    var commentorList = document.createElement("div");
    commentorList.classList.add("commentors");
    actualTab.innerHTML = "";
    makeAddCommentSection(actualTab);
    actualTab.appendChild(commentorList);
    
    // Fetch the Source of Truth. This may use the cache or get fresh data
    // depending on whether it was invalidated.
    var aliases = await getAndSaveAliases();
    
    console.log(`[Panel Sync] Rebuilding commentator list UI with ${aliases.length} aliases.`);
    window.aliasesOfComments = aliases;

    if (!aliases.length) {
        commentorList.innerHTML = "Be the first to comment on this verse!";
        return [];
    }

    var tabs = [];
    aliases.forEach(alias => {
        var tab = addTab({
            header: "@" + alias,
            btnParent: actualTab,
			addClasses: true,
			parent:mainParent,
			tabParent: tab,
			content: "Loading...",
			async onopen({ actualTab }) {
				curTab = tab;
				window.curTab = curTab;
				openCommentsOfAlias({
					alias,
					actualTab,
					post,
				})
			}
        });
        tabs.push(tab);
    });
    return tabs;
}
async function selectAndUpload({heichel, series, postId, verseNum, author, type="audio"}) {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
 //   fileInput.accept = "audio/*"; // Restrict to audio files

    // Create a promise to handle file selection
    const filePromise = new Promise((resolve, reject) => {
        fileInput.addEventListener("change", event => {
            const file = event.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject(new Error("No file selected"));
            }
        });
    });

    // Simulate a click to open the file selector
    fileInput.click();

    try {
        // Wait for the user to select a file
        const file = await filePromise;
       // document.body.removeChild(fileInput); // Clean up the input element

        // Upload the selected file
        const url = URL.createObjectURL(file);
        const result = await uploadBlobToS3(url, heichel, series, postId, verseNum, author, 
					    type=="audio"?"koyl.mp3" : 
					    type=="timesheet" ? "timesheet.json":null
					);

        // Revoke the object URL to free memory
        URL.revokeObjectURL(url);

        console.log("File uploaded successfully:", result);
        return result;
    } catch (error) {
        //document.body.removeChild(fileInput); // Ensure cleanup on error
        console.error("Error uploading file:", error);
        throw error;
    }
}
async function uploadBlobToS3(url, heichel, series, postId, verseNum, author, fileName) {
	if(!fileName) return alert("incorrect filename ")
    // Retrieve AWS credentials and bucket info from localStorage
    const storageKey = "awsCredentials";
    let awsConfig = JSON.parse(localStorage.getItem(storageKey));
    const requiredKeys = ["accessKeyId", "secretAccessKey", "accountId", "bucket"];

    // Check if all required keys are present, otherwise prompt the user
    if (!awsConfig || !requiredKeys.every(key => awsConfig[key])) {
        awsConfig = {};
        requiredKeys.forEach(key => {
            const value = window.prompt(`Enter ${key}:`);
            if (!value) throw new Error(`Missing value for ${key}`);
            awsConfig[key] = value;
        });
        // Save the updated config to localStorage
        localStorage.setItem(storageKey, JSON.stringify(awsConfig));
    }

    // Fetch the blob and prepare it for upload
    const blob = await (await fetch(url)).blob();
    const arr = await blob.arrayBuffer();
    const int = new Uint8Array(arr);

    // Generate the S3 key path
    const key = `heichelos/${heichel}/series/${series}/postId/${postId}/verse/${verseNum}/${author}/${fileName}`;

    // Call the sendIt function
    const result = await sendIt({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
        accountId: awsConfig.accountId,
        bucket: awsConfig.bucket,
        key: key,
        content: int
    });

    // Return the bucket and path info
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



// This function allows CommentSection.js to tell our inline tracker it's out of date.
function invalidateInlineTracker(verseSection) {
    if (loadedInlineVerses[verseSection]) {
        delete loadedInlineVerses[verseSection];
    }
}


/**
 * The high-level conductor for the "new comment" user experience. It is called
 * from outside this module to trigger a complete and synchronized UI update.
 */
async function handleNewComment({ aliasId, verseSection, commentId, newCommentData }) {
    console.log(`[Finale] Orchestrating UI for new comment ${commentId} by ${aliasId}`);
    
    // 1. Invalidate everything for the target verse.
    invalidateVerseCache(verseSection);

    // 2. Handle Inline Update immediately.
    if (isAliasInline(aliasId) && newCommentData) {
        const memoryKey = `${aliasId}-${verseSection}`;
        delete loadedInlineVerses[memoryKey]; // Invalidate inline memory to force re-render.
        console.log("[Finale] Alias is inline, adding new comment directly to DOM.");
        addCommentsInline([newCommentData], aliasId);
        loadedInlineVerses[memoryKey] = true; // Re-set memory.
    }

    // 3. Rebuild, open, and navigate the panel.
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
	indexSwitch,
    invalidateInlineTracker
}

// Expose ONLY the high-level functions needed by other modules
window.commentLogic = {
    handleNewComment // The only function CommentSection needs to know about.
};