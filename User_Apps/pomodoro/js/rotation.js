let accumulatedRotation = 0;
let lastGamma = null;
let currentZone = 0;
let onZoneChange = null;
let isLocked = false;
let isUsingGyro = false;
let gyroFailed = false;

const rotation = {
    permissionGranted: false,
    
    init(onZoneChangeCallback, applyLockState = true) {
        onZoneChange = onZoneChangeCallback;
        
        const needsPermission = typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function';
        
        console.log('Rotation init: needsPermission =', needsPermission);
        
        if (!needsPermission) {
            this.permissionGranted = true;
            isUsingGyro = true;
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
            console.log('DeviceOrientation: Added listener without permission (Android/non-iOS)');
        } else if (this.permissionGranted) {
            isUsingGyro = true;
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        }
    },
    
    setPermissionGranted() {
        this.permissionGranted = true;
        isUsingGyro = true;
        window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        console.log('DeviceOrientation: Permission granted, listener added');
    },
    
    setupKeyboardFallback() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                accumulatedRotation -= 90;
                this.updateZone();
            } else if (e.key === 'ArrowRight') {
                accumulatedRotation += 90;
                this.updateZone();
            }
        });
    },
    
    updateZone() {
        let wrappedRotation = accumulatedRotation;
        
        if (wrappedRotation >= 0) {
            wrappedRotation = wrappedRotation % 360;
        } else {
            wrappedRotation = ((wrappedRotation % 360) + 360) % 360;
        }
        
        const shiftedRotation = (wrappedRotation + 45) % 360;
        const newZone = Math.floor(shiftedRotation / 90);
        
        if (newZone !== currentZone) {
            const previousZone = currentZone;
            currentZone = newZone;
            
            if (onZoneChange) {
                onZoneChange(currentZone, previousZone);
            }
        }
        
        window.dispatchEvent(new CustomEvent('rotation-update', {
            detail: { rotation: wrappedRotation, zone: currentZone, gamma: wrappedRotation }
        }));
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
        if (isLocked) return;
        
        const alpha = event.alpha;
        
        console.log('DeviceOrientation event - alpha:', alpha, 'beta:', event.beta, 'gamma:', event.gamma);
        
        if (alpha === null) {
            console.log('DeviceOrientation: alpha is null');
            return;
        }
        
        let diff = 0;
        if (lastGamma !== null) {
            diff = alpha - lastGamma;
            
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            
            accumulatedRotation += diff;
        }
        
        lastGamma = alpha;
        
        let wrappedRotation = accumulatedRotation;
        if (wrappedRotation >= 0) {
            wrappedRotation = wrappedRotation % 360;
        } else {
            wrappedRotation = ((wrappedRotation % 360) + 360) % 360;
        }
        
        const shiftedRotation = (wrappedRotation + 45) % 360;
        const newZone = Math.floor(shiftedRotation / 90);
        
        console.log('Delta:', diff, 'Accumulated:', accumulatedRotation, 'Wrapped:', wrappedRotation, 'Zone:', newZone);
        
        if (newZone !== currentZone) {
            const previousZone = currentZone;
            currentZone = newZone;
            
            if (onZoneChange) {
                onZoneChange(currentZone, previousZone);
            }
        }
        
        window.dispatchEvent(new CustomEvent('rotation-update', {
            detail: { rotation: wrappedRotation, zone: currentZone, gamma: alpha }
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
        console.log('Rotation locked');
    },
    
    unlock() {
        isLocked = false;
        console.log('Rotation unlocked');
    },
    
    setLocked(locked) {
        isLocked = locked;
        console.log('Rotation lock state:', isLocked);
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
