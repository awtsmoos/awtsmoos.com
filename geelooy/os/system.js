/*B"H*/
export default class System {
    path = null
    os = null
    constructor({path, os}={}) {
        this.path = path;
        this.os = os
    }
    async save(program) {
        var content = program?.content();
        var fileName = program?.fileName();
        console.log("Trying",fileName,content,program);
        if(!fileName) return false;
        var path = this.path;
        if(!path) return;
        console.log("doing filenam",fileName,content);
        
        window.os = this.os;
        
        await this.os?.db.Koysayv(path, fileName, content);
        return true;
    }
    async makeToast(text) {
        // Create toast container
        const toast = document.createElement('div');
        
        // Apply toast styles
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '16px'; // Positioned towards the bottom
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '12px 24px';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.fontSize = '14px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s, bottom 0.5s';

        // Append the toast to the body
        document.body.appendChild(toast);

        // Animate toast visibility
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.bottom = '32px'; // Adjust for a smooth "slide-up" effect
        }, 100);

        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.bottom = '16px'; // Slide back down

            // Remove the toast element from the DOM after the animation is complete
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }
}