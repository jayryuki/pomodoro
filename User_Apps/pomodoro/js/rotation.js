let accumulatedRotation = 0;
let lastGamma = null;
let currentZone = 0;
let onZoneChange = null;
let isLocked = true;

const rotation = {
    init(onZoneChangeCallback) {
        onZoneChange = onZoneChangeCallback;
        
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            this.requestPermission();
        } else {
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        }
    },
    
    async requestPermission() {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
            }
        } catch (e) {
            console.error('Device orientation permission denied', e);
        }
    },
    
    handleOrientation(event) {
        const gamma = event.gamma;
        
        if (gamma === null) return;
        
        if (lastGamma !== null) {
            let delta = gamma - lastGamma;
            
            if (delta > 90) delta -= 180;
            if (delta < -90) delta += 180;
            
            accumulatedRotation += delta;
        }
        
        lastGamma = gamma;
        
        const newZone = Math.floor(accumulatedRotation / 90) % 4;
        const normalizedZone = newZone < 0 ? newZone + 4 : newZone;
        
        if (normalizedZone !== currentZone) {
            const previousZone = currentZone;
            currentZone = normalizedZone;
            
            if (onZoneChange) {
                onZoneChange(currentZone, previousZone);
            }
        }
        
        window.dispatchEvent(new CustomEvent('rotation-update', {
            detail: { rotation: accumulatedRotation, zone: currentZone }
        }));
    },
    
    getAccumulatedRotation() {
        return accumulatedRotation;
    },
    
    getCurrentZone() {
        return currentZone;
    },
    
    lock() {
        isLocked = true;
    },
    
    unlock() {
        isLocked = false;
    },
    
    isLocked() {
        return isLocked;
    },
    
    reset() {
        accumulatedRotation = 0;
        lastGamma = null;
        currentZone = 0;
    }
};
