// B"H
// allows user to fetch text or binary data

// In-memory storage for rate limiting
// Structure: { [userId]: { requests: 0, bytes: 0, resetTime: timestamp } }
const usageTracker = {};

const LIMITS = {
  requestsPerMin: 30, // Max 30 requests per minute
  mbPerMin: 50 // Max 50 Megabytes per minute
};

module.exports = {
  dynamicRoutes: async $i => {
    
    await $i.use({
      "/": async v => {
      
        // 1. Security: Authenticate & Validate Origin
        if (!loggedIn($i)) {
            return { error: "Unauthorized: You must be logged in.", status: 401 };
        }

        // Get the origin or referer to ensure it's from awtsmoos.com
        var headers = $i.request.headers;
        var origin = headers.origin || headers.referer || "";
        
        if (!origin.toLowerCase().includes("awtsmoos.com")) {
             return { error: "Forbidden: Request must originate from Awtsmoos.com", status: 403 };
        }

        // 2. Rate Limiting Logic
        var userId = $i.request.user.info.userId;
        var now = Date.now();
        
        // Initialize user bucket if not exists or if minute has passed
        if (!usageTracker[userId] || now > usageTracker[userId].resetTime) {
            usageTracker[userId] = {
                requests: 0,
                bytes: 0,
                resetTime: now + 60000 // Reset in 1 minute
            };
        }

        var usage = usageTracker[userId];

        // Check Count Limit
        if (usage.requests >= LIMITS.requestsPerMin) {
            return { error: "Rate limit exceeded (Request Count). Try again later.", status: 429 };
        }
        
        // Check Bandwidth Limit (converted to Bytes)
        if (usage.bytes >= (LIMITS.mbPerMin * 1024 * 1024)) {
            return { error: "Rate limit exceeded (Bandwidth). Try again later.", status: 429 };
        }

        // 3. Prepare the Request
        var input = $i.$_POST; 
        
        // FIX: Handle Raw JSON Body
        // index.js stores JSON bodies as a Buffer in __raw_body__. We need to parse it.
        if (input && input.__raw_body__) {
            try {
                var str = input.__raw_body__.toString('utf-8');
                input = JSON.parse(str);
            } catch(e) {
                // If it fails, input remains as is (could be actual binary data)
            }
        }
        
        if (!input || !input.url) {
            return { error: "Missing 'url' in request body.", post: $i.$_POST, status: 400 };
        }

        var targetUrl = input.url;
        var method = (input.method || "GET").toUpperCase();
        
        // Construct Headers
        var reqHeaders = input.headers || {};
        
        // Inject Custom Cookies into the 'Cookie' header
        if (input.cookies && typeof input.cookies === 'object') {
            var cookieStrings = [];
            for(var [key, val] of Object.entries(input.cookies)) {
                cookieStrings.push(`${key}=${val}`);
            }
            if(cookieStrings.length) {
                // If there's already a cookie header, append; otherwise set.
                var existing = reqHeaders['cookie'] || reqHeaders['Cookie'] || "";
                reqHeaders['Cookie'] = (existing ? existing + "; " : "") + cookieStrings.join("; ");
            }
        }

        // Prepare Fetch Options
        var options = {
            method: method,
            headers: reqHeaders
        };

        if (method !== "GET" && method !== "HEAD") {
            options.body = input.body;
        }

        try {
            // 4. Execute Fetch
            var response = await fetch(targetUrl, options);
            
            // 5. Process Response
            
            // Handle Response Cookies (Set-Cookie)
            var responseCookies = [];
            if (response.headers.raw && typeof response.headers.raw === 'function') {
                 responseCookies = response.headers.raw()['set-cookie'] || [];
            } else if (response.headers.getSetCookie) {
                 responseCookies = response.headers.getSetCookie();
            } else {
                 var c = response.headers.get('set-cookie');
                 if(c) responseCookies.push(c);
            }

            var responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Handle Body (Text vs Binary)
            var arrayBuffer = await response.arrayBuffer();
            var buffer = Buffer.from(arrayBuffer);
            var contentSize = buffer.length;

            // UPDATE RATE LIMITS
            usage.requests++;
            usage.bytes += contentSize;

            var contentType = (responseHeaders['content-type'] || "").toLowerCase();
            var isText = contentType.includes('text') || contentType.includes('json') || contentType.includes('xml') || contentType.includes('html');
            
            var responseBody;
            if (isText) {
                responseBody = buffer.toString('utf-8');
            } else {
                // Return binary as Base64
                responseBody = buffer.toString('base64');
            }

            // Return the bundled result
            return {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                setCookies: responseCookies,
                isBinary: !isText,
                data: responseBody,
                usageInfo: {
                    requestsUsed: usage.requests,
                    mbUsed: (usage.bytes / 1024 / 1024).toFixed(2)
                }
            };

        } catch (err) {
            return { 
                error: "Fetch Error", 
                details: err.message, 
                stack: err.stack 
            };
        }
      }
   });
  }
};

function loggedIn($i) {
    return !!($i.request && $i.request.user);
}