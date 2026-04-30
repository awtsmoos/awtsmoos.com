
// B"H
/**
 * @file ArchiveS3Bridge.js
 * @description
 * "He stores the waters of the sea in a heap; He puts the depths into storehouses."
 * 
 * We have added lights (logs) to this bridge. When a spark is too heavy for the 
 * Firestore vessel, we attempt to place it in the Archive.org treasury. 
 * If the guardians of that realm (spam filters) reject our offering with a 
 * 503 SlowDown, we log the refusal clearly so the Pivot logic can engage.
 */

const https = require("https");
const credentials = require("./ArchiveCredentials.js");

class ArchiveS3Bridge {
    static async upload(bucket, key, content, contentType = "application/octet-stream", log) {
        const hostname = "s3.us.archive.org";
        const path = `/${bucket}/${encodeURIComponent(key)}`;
        
        log(`[ARCHIVE_START] B"H: Attempting to upload to Archive.org bucket: ${bucket}`);
        
        return new Promise((resolve, reject) => {
            const body = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
            
            const options = {
                hostname,
                port: 443,
                path,
                method: "PUT",
                headers: {
                    "Authorization": `LOW ${credentials.accessKey}:${credentials.secretKey}`,
                    "Content-Type": contentType,
                    "Content-Length": body.length,
                    "x-amz-auto-make-bucket": "1",
                    "x-archive-meta-collection": "opensource",
                    "x-archive-meta-mediatype": "data"
                }
            };

            const req = https.request(options, (res) => {
                let resBody = "";
                res.on("data", (chunk) => resBody += chunk);
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const publicUrl = `https://archive.org/download/${bucket}/${key}`;
                        log(`[ARCHIVE_SUCCESS] B"H: Elevated to Archive.org. Public Link: ${publicUrl}`);
                        resolve(publicUrl);
                    } else {
                        const error = new Error(resBody || `Status ${res.statusCode}`);
                        if (res.statusCode === 503 && resBody.includes("SlowDown")) {
                            log(`[ARCHIVE_REFUSAL] B"H: Archive.org has reached capacity (SlowDown). Redirecting spark.`);
                            error.isSpamError = true;
                        } else {
                            log(`[ARCHIVE_ERROR] B"H: Archive.org rejected with status ${res.statusCode}: ${resBody}`);
                        }
                        reject(error);
                    }
                });
            });

            req.on("error", (err) => {
                log(`[ARCHIVE_CRASH] B"H: Network failure to Archive.org: ${err.message}`);
                reject(err);
            });

            req.write(body);
            req.end();
        });
    }
}

module.exports = ArchiveS3Bridge;
