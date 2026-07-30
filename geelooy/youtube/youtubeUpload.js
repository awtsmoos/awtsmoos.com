// B"H
export function uploadToGoogle({ uploadUrl, file, contentType, onProgress }) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('PUT', uploadUrl);
		request.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');
		request.upload.addEventListener('progress', event => {
			if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
		});
		request.addEventListener('load', () => {
			if (request.status >= 200 && request.status < 300) {
				resolve(request.responseText ? JSON.parse(request.responseText) : {});
				return;
			}
			reject(new Error(`YouTube upload failed with status ${request.status}`));
		});
		request.addEventListener('error', () => reject(new Error('The browser lost its connection to YouTube.')));
		request.send(file);
	});
}
