// /BH/awtsmoos.com/geelooy/heichelos/post/comments/actions/media.js
//B"H
import { sendIt } from "/scripts/awtsmoos/api/helperScripts/s3-manager.js";

export async function handleUpload(comment, type) {
    var auth = comment.author;
    if(window?.curAlias != auth) return alert("Not the author!");
    
    var search = new URLSearchParams(location.search);
    var verseNum = search.get("idx") || "root";
    
    try {
        var r = await selectAndUpload({ 
            type, 
            heichel: window.post.heichel.id, 
            series: window.series.id, 
            postId: window.post.id, 
            verseNum, 
            author: auth 
        });
        
        var body = { 
            aliasId: window.curAlias, 
            commentId: comment.id, 
            dayuh: JSON.stringify(type == "audio" ? { transcripted: { time: Date.now(), ...r } } : { timesheet: { time: Date.now(), ...r } }) 
        };
        
        await fetch(`/api/social/heichelos/${window.post.heichel.id}/post/${window.post.id}/comments/`, { 
            method: "PUT", 
            body: new URLSearchParams(body) 
        });
        
        alert("Uploaded!");
        if(window.reloadRoot) window.reloadRoot();
        
    } catch(e) { 
        alert("Error: " + e.message); 
    }
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