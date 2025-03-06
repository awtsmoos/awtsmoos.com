//B"H
async function animationToVideo({
    name,
    width,
    height,
    duration,
    action,
    fps
}={}) {

    
    await importJs("./awts-muxer.js")
    //console.log("OK",WebMMuxer);

    // Create an inline Web Worker
    const workerBlob = new Blob([`
        (${function() {
                onmessage = async function(e) {
                var {
                    width, 
                    height, 
                    fps, 
                    duration,
                    action,
                    script
                } = e.data;
                var ob = `({
                    action: ${
                        action
                    }
                })`
                var ob = eval(ob);
                action = ob.action;
                const totalFrames = duration * fps;
                
                
                const canvas = new OffscreenCanvas(width, height);
                
                var webm = eval("("+script+")");
                var WebMMuxer = new webm();

                const muxer = new WebMMuxer.Muxer({
                    target: new WebMMuxer.ArrayBufferTarget(),
                    video: {
                        codec: 'V_VP8',
                        width: width,
                        height: height,
                        frameRate: fps
                    },
                    fastStart: 'in-memory',
                    firstTimestampBehavior: 'offset'
                });

                const videoEncoder = new VideoEncoder({
                    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                    error: e => console.error("Encoding error:", e)
                });

                videoEncoder.configure({
                    codec: 'vp8',
                    width,
                    height,
                    bitrate: 1_000_000, // 1 Mbps
                    framerate: fps
                });

                await action({
                    canvas,
                    videoEncoder,
                    totalFrames
                });

                await videoEncoder.flush();
                muxer.finalize();

                const buffer = muxer.target.buffer;
                postMessage({ buffer });
            };
        }})()
        
    `], { type: 'application/javascript' });

    const worker = new Worker(URL.createObjectURL(workerBlob));

    worker.onmessage = function (e) {
        const buffer = e.data.buffer;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([buffer], { type: 'video/mp4' }));
        a.download = name+'.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("Video successfully generated!");
    };

    // Post the necessary data to the worker
    worker.postMessage({
        width, height, fps, duration, 
        action: action+"",
        script:WebMMuxer+"" });
};

function importJs(url) {
    return new Promise((r,j) => {

        var f = document.createElement("script");
        f.onload = async () => {
            await new Promise(rr=>{
                setTimeout(() => {
                    rr()
                },1000)
            })
            
            r();
        }
        f.src = url;
        document.body.appendChild(f);
    })  

}

if(this.module) {
    module.exports = animationToVideo;
}