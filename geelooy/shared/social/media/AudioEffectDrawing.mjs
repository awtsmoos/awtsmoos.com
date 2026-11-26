// B"H — Awtsmoos.com gives visible form to the audible signal.
const colors=['#ffe3a9','#75d8ff','#b79aff'];
export function draw(context, canvas, wave, spectrum, mode) {
	const w=canvas.width,h=canvas.height;
	context.fillStyle='#10182b';context.fillRect(0,0,w,h);
	if(mode==='spectrum') {
		const count=48, width=w/count;
		for(let i=0;i<count;i++) {
			const value=spectrum[Math.floor(i*spectrum.length/count)]/255;
			context.fillStyle=colors[i%3];context.fillRect(i*width,h-value*h*.85,Math.max(1,width-3),value*h*.85);
		}
		return;
	}
	context.strokeStyle=colors[1];context.lineWidth=2;context.beginPath();
	for(let i=0;i<wave.length;i++) {
		const angle=i/(wave.length-1)*Math.PI*2;
		const radius=Math.min(w,h)*(.25+wave[i]*.12);
		const x=mode==='celestial'?w/2+Math.cos(angle)*radius:i/(wave.length-1)*w;
		const y=mode==='celestial'?h/2+Math.sin(angle)*radius:h/2+wave[i]*h*.42;
		if(i===0)context.moveTo(x,y);else context.lineTo(x,y);
	}
	context.stroke();
	if(mode==='celestial') {
		context.strokeStyle=colors[0];context.beginPath();context.arc(w/2,h/2,Math.min(w,h)*.18,0,Math.PI*2);context.stroke();
		context.fillStyle=colors[2];context.font='24px serif';context.textAlign='center';context.fillText('✦',w/2,h/2+8);
	}
}
