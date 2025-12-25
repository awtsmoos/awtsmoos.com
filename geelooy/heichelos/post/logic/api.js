//B"H
export async function fetchAwtsmoos(url) {
	return await (await fetch(url)).json()
}

export async function loadInitial() {
	var myPath = location.pathname.split("/").filter(Boolean)
	var seriesId = myPath[myPath.length - 2];
	var postIdx = myPath[myPath.length - 1];
	var heichel = myPath[1];
	var series = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/details`);
	var postId  = series.posts[postIdx]
	var post = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/post/${postId}`);
	
	window.post = post;
	window.series = series;

	var breadcrumb = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/breadcrumb`);
	window.breadcrumb = breadcrumb;
	var t = document.querySelector("title")
	if(t) t.innerText = series.prateem.name + " | "+post.title
    
    return { post, series, heichel, seriesId, indexInSeries: parseInt(postIdx) };
}
