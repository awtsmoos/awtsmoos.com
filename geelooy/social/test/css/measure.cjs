// B"H — Awtsmoos.com checks readability, visibility and geometry together.
/** Browser-side function, deliberately free of Node dependencies. */
function measure(kind) {
	const host=document.getElementById('isolated-quick-post');
	const scope=kind==='composer'?host?.shadowRoot:document;
	if(!scope)return {error:'Quick composer unavailable'};
	const selectors={social:['.product-brand','.product-hero h1','.product-primary','.product-feed h2'],profile:['h1'],heichelos:['h1'],composer:['h1','#body','#destination','.tools','#next']};
	function rgb(value){const match=value.match(/^rgba?\(([^)]+)\)$/);if(!match)return null;const numbers=match[1].split(',').map(Number);return numbers.length===4&&numbers[3]===0?null:numbers;}
	function luminance(rgb){return rgb.slice(0,3).map(n=>{const s=n/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);}
	function background(element){for(let current=element;current;current=current.parentElement || current.getRootNode()?.host){const result=rgb(getComputedStyle(current).backgroundColor);if(result && (result[3]===undefined || result[3]===1))return result;}return [255,255,255];}
	const items=selectors[kind].map(selector=>{
		const element=scope.querySelector(selector);if(!element)return {selector,missing:true};
		const rect=element.getBoundingClientRect(),style=getComputedStyle(element),fg=rgb(style.color),bg=background(element);
		const contrast=fg?(Math.max(luminance(fg),luminance(bg))+.05)/(Math.min(luminance(fg),luminance(bg))+.05):null;
		return {selector,text:(element.textContent || element.placeholder || '').trim().slice(0,60),x:rect.x,y:rect.y,w:rect.width,h:rect.height,color:style.color,background:bg,contrast,visible:rect.width>0&&rect.height>0&&style.visibility==='visible'&&Number(style.opacity)>0};
	});
	return {url:location.pathname,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,items,shadow:!!host?.shadowRoot,legacyInert:!!document.querySelector('.composerLayout')?.inert,pickerHidden:scope.getElementById('picker')?.hidden,hostWidth:host?.scrollWidth,viewportHeight:innerHeight};
}
module.exports={measure};
