/*
ב"ה
B"H
*/

// AudioBuffer Shim for Mediabunny compatibility in Worker
self.AudioBuffer = function(options) {
    Object.assign(this, options);

    this.getChannelData = function(channelIndex) {
        return this.channels[channelIndex];
    };

    this.copyFromChannel = function(destination, channelNumber, startInChannel = 0) {
        const source = this.channels[channelNumber];
        if (!source) return;
        const slice = source.subarray(startInChannel, startInChannel + destination.length);
        destination.set(slice);
    };
};