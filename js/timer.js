const timer = {
    duration: 0,
    remaining: 0,
    intervalId: null,
    state: 'stopped',
    onTick: null,
    onComplete: null,
    
    setDuration(minutes) {
        this.duration = minutes * 60;
        this.remaining = this.duration;
    },
    
    start() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.state = 'running';
        
        this.intervalId = setInterval(() => {
            if (this.remaining > 0) {
                this.remaining--;
                
                if (this.onTick) {
                    this.onTick(this.remaining, this.duration);
                }
            } else {
                this.stopInterval();
                this.state = 'alarm';
                
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    },
    
    stop() {
        this.stopInterval();
        this.state = 'stopped';
    },
    
    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    
    reset() {
        this.stop();
        this.remaining = this.duration;
    },
    
    getState() {
        return this.state;
    },
    
    getRemaining() {
        return this.remaining;
    },
    
    getDuration() {
        return this.duration;
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};
