//B"H
import { deleteComment, AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import playText from "/heichelos/post/playText.js";
import { sendIt } from "/scripts/awtsmoos/api/helperScripts/s3-manager.js";

var loop = null;

export async function handleMenuOption(option, comment, el) {
	console.log("Selected:", option, "on comment:", comment);
    var post = window.post;
    var series = window.series;

	switch(option) {
		case "Edit": alert("Coming soon iyh!"); break;
		case "Delete":
			try {
				await deleteComment({
					heichelId: post.heichel.id, parentType: "post", parentId: post.id,
					seriesId: series.id, postId: post.id, aliasId: window.curAlias, commentId: comment.id
				});
				await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Successfully deleted that comment" });
			} catch(e) {
				await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Issue deleting: " + e.stack });
			}
		break;
		case "Reply": alert("Coming soon iyh!"); break;
		case "Play":
			var aud = document.querySelector("audio[data-awtsmoos-audio='" + comment.id + "'");
			if(!aud) return alert("Issue");
			var isPlaying = false;
			var tm = comment?.dayuh?.timesheet;
			var sheet = null;
			window.audio = aud;
			if(tm) {
				sheet = await (await fetch("https://" + tm.bucket + ".awtsmoos.com/" + tm.path)).json();
				window.timesheet = tm;
			}
			if(sheet) {
				var els = sheet.monologues[0].elements;
				var map = createTimeHashMap(els);
				if(!loop) {
                    var lastText = null;
                    loop = () => {
                        var t = aud?.currentTime;
                        if(t) {
                            var entry = findCurrentElementHashMap(t,map);
                            if(entry !== null) {
                                var letter = entry.value;
                                if(letter != lastText && letter !== null) {
                                    lastText = letter;
                                    playText(letter);
                                }
                            }
                        }
                        requestAnimationFrame(loop);
                    };
                    loop();
				}
			}
			if(!aud.paused) { aud.pause(); el.textContent = "Play"; isPlaying = false; }
            else { aud.play(); el.textContent = "Pause"; isPlaying = true; }
		break;
		case  "Add Timesheet": await handleUpload(comment, "timesheet"); break;
		case  "Add Audio": await handleUpload(comment, "audio"); break;
		case "Copy":
			try { navigator.clipboard.writeText(comment?.content); } catch(e) { alert("Issue copying"); }
		break;
	}
}

async function handleUpload(comment, type) {
    var auth = comment.author;
    if(window?.curAlias != auth) return alert("Not the author!");
    var search = new URLSearchParams(location.search);
    var verseNum = search.get("idx") || "root";
    try {
        var r = await selectAndUpload({ type, heichel: window.post.heichel.id, series: window.series.id, postId: window.post.id, verseNum, author: auth });
        var body = { aliasId: window.curAlias, commentId: comment.id, dayuh: JSON.stringify(type == "audio" ? { transcripted: { time: Date.now(), ...r } } : { timesheet: { time: Date.now(), ...r } }) };
        await fetch(`/api/social/heichelos/ikar/post/${window.post.id}/comments/`, { method: "PUT", body: new URLSearchParams(body) });
        alert("Uploaded!");
    } catch(e) { alert("Error: " + e.message); }
}

export async function selectAndUpload({heichel, series, postId, verseNum, author, type="audio"}) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    const filePromise = new Promise((resolve, reject) => {
        fileInput.addEventListener("change", event => {
            const file = event.target.files[0];
            if (file) resolve(file); else reject(new Error("No file selected"));
        });
    });
    fileInput.click();
    const file = await filePromise;
    const url = URL.createObjectURL(file);
    const result = await uploadBlobToS3(url, heichel, series, postId, verseNum, author, type=="audio"?"koyl.mp3" : "timesheet.json");
    URL.revokeObjectURL(url);
    return result;
}

export async function uploadBlobToS3(url, heichel, series, postId, verseNum, author, fileName) {
    const storageKey = "awsCredentials";
    let awsConfig = JSON.parse(localStorage.getItem(storageKey));
    if (!awsConfig) {
        awsConfig = {};
        ["accessKeyId", "secretAccessKey", "accountId", "bucket"].forEach(key => {
            awsConfig[key] = window.prompt(`Enter ${key}:`);
        });
        localStorage.setItem(storageKey, JSON.stringify(awsConfig));
    }
    const blob = await (await fetch(url)).blob();
    const arr = await blob.arrayBuffer();
    const int = new Uint8Array(arr);
    const key = `heichelos/${heichel}/series/${series}/postId/${postId}/verse/${verseNum}/${author}/${fileName}`;
    await sendIt({ ...awsConfig, key: key, content: int });
    return { bucket: awsConfig.bucket, path: key };
}

// Helper functions for playback...
function createTimeHashMap(array, resolution = 0.01) {
    var gro = groupTimedData(array);
    const hashMap = new Map();
    gro.forEach(item => {
        for (let t = item.ts; t <= item.end_ts; t += resolution) {
            const roundedTime = Math.round(t * (1 / resolution)) / (1 / resolution);
            hashMap.set(roundedTime, item);
        }
    });
    return hashMap;
}
function findCurrentElementHashMap(time, hashMap, resolution = 0.01) {
    const roundedTime = Math.round(time * (1 / resolution)) / (1 / resolution);
    return hashMap.get(roundedTime) || null;
}
function groupTimedData(input) {
    let groupedData = [];
    let currentGroup = null;
    input.forEach(item => {
        if (item.ts !== undefined && item.end_ts !== undefined) {
            if (currentGroup) groupedData.push(currentGroup);
            currentGroup = { type: "text", value: item.value, ts: item.ts, end_ts: item.end_ts };
        } else {
            if (currentGroup) currentGroup.value += item.value;
        }
    });
    if (currentGroup) groupedData.push(currentGroup);
    return groupedData;
}
