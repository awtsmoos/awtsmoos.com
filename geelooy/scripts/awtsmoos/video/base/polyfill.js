/* B"H */
self.AudioBuffer = self.AudioBuffer || function AudioBuffer(options) {
    this.channels = options.channels || [];
    this.sampleRate = options.sampleRate;
    this.length = options.length;
    this.duration = options.duration;
    this.numberOfChannels = options.numberOfChannels;
    this.getChannelData = i => this.channels[i];
    this.copyFromChannel = (dest, channelNum, start = 0) => {
        const source = this.channels[channelNum];
        if (source) dest.set(source.subarray(start, start + dest.length));
    };
};
