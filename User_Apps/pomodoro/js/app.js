const app = {
    presets: [5, 10, 30, 60],
    currentPresetIndex: 0,
    alarmSound: null,
    
    init() {
        this.presets = settings.getPresets();
        
        this.alarmSound = document.getElementById('alarm-sound');
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        this.bindElements();
        this.bindEvents();
        this.initRotation();
        this.updateDisplay();
        this.updateDebugVisibility();
        this.updateOrientationIndicator({ zone: 0, rotation: 0 });
        
        window.addEventListener('settings-changed', () => {
            this.presets = settings.getPresets();
            this.updateDebugVisibility();
            this.updatePresetIndicator();
            rotation.setLocked(!settings.isRotationUnlocked());
        });
        
        window.addEventListener('rotation-update', (e) => {
            console.log('Rotation update event:', e.detail);
            this.updateOrientationIndicator(e.detail);
            if (settings.isDebugEnabled()) {
                document.getElementById('debug-gamma').textContent = 
                    e.detail.gamma !== null ? Math.round(e.detail.gamma) : 'null';
                document.getElementById('debug-rotation').textContent = 
                    Math.round(e.detail.rotation);
                document.getElementById('debug-zone').textContent = e.detail.zone;
                document.getElementById('debug-locked').textContent = rotation.isLocked();
            }
        });
        
        window.addEventListener('sprites-changed', () => {
            this.applySprites();
        });
    },
    
    bindElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.startBtn = document.getElementById('start-btn');
        this.presetIndicator = document.getElementById('current-preset');
    },
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        
        timer.onTick = (remaining, duration) => {
            this.updateDisplay();
        };
        
        timer.onComplete = () => {
            this.triggerAlarm();
        };
    },
    
    initRotation() {
        const isUnlocked = settings.isRotationUnlocked();
        console.log('Init rotation: unlocked =', isUnlocked);
        
        rotation.setLocked(!isUnlocked);
        
        rotation.init((newZone, previousZone) => {
            this.handleZoneChange(newZone, previousZone);
        });
    },
    
    requestOrientationPermissionEarly() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            if (!window.rotationPermissionRequested) {
                window.rotationPermissionRequested = true;
                DeviceOrientationEvent.requestPermission()
                    .then(permission => {
                        if (permission === 'granted') {
                            rotation.setPermissionGranted();
                        }
                    })
                    .catch(console.error);
            }
        }
    },
    
    activatePreset(zoneIndex) {
        let normalizedIndex = zoneIndex;
        while (normalizedIndex < 0) {
            normalizedIndex += this.presets.length;
        }
        normalizedIndex = normalizedIndex % this.presets.length;
        
        this.currentPresetIndex = normalizedIndex;
        const presetMinutes = this.presets[normalizedIndex];
        
        timer.setDuration(presetMinutes);
        this.updateDisplay();
        this.updatePresetIndicator();
    },
    
    toggleTimer() {
        this.requestOrientationPermission();
        
        const state = timer.getState();
        
        if (state === 'stopped' || state === 'alarm') {
            this.startTimer();
        } else if (state === 'running') {
            this.stopTimer();
        }
    },
    
    startTimer() {
        timer.start();
        this.startBtn.textContent = 'Stop';
    },
    
    stopTimer() {
        this.stopAlarm();
        timer.stop();
        this.startBtn.textContent = 'Start';
    },
    
    requestOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            if (!window.rotationPermissionRequested) {
                window.rotationPermissionRequested = true;
                DeviceOrientationEvent.requestPermission()
                    .then(permission => {
                        if (permission === 'granted') {
                            rotation.setPermissionGranted();
                            rotation.setLocked(!settings.isRotationUnlocked());
                            rotation.init((newZone, previousZone) => {
                                this.handleZoneChange(newZone, previousZone);
                            });
                        }
                    })
                    .catch(console.error);
            }
        }
    },
    
    handleZoneChange(newZone, previousZone) {
        console.log('Zone change:', previousZone, '->', newZone);
        
        const timerState = timer.getState();
        
        if (timerState === 'alarm') {
            this.stopAlarm();
            this.activatePreset(newZone);
            timer.start();
            this.startBtn.textContent = 'Stop';
            return;
        }
        
        this.activatePreset(newZone);
    },
    
    triggerAlarm() {
        this.startBtn.textContent = 'Start';
        document.body.classList.add('alarm-active');
        
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: 'Time is up!',
                icon: 'icons/icon-192.png'
            });
        }
        
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500, 200, 500]);
        }
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 880;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        
        this.alarmOscillator = oscillator;
        this.alarmGainNode = gainNode;
        this.alarmAudioCtx = audioCtx;
        
        oscillator.start();
        
        this.alarmInterval = setInterval(() => {
            oscillator.frequency.value = oscillator.frequency.value === 880 ? 660 : 880;
        }, 500);
    },
    
    stopAlarm() {
        if (this.alarmOscillator) {
            this.alarmOscillator.stop();
            this.alarmOscillator = null;
        }
        if (this.alarmGainNode) {
            this.alarmGainNode = null;
        }
        if (this.alarmAudioCtx) {
            this.alarmAudioCtx.close();
            this.alarmAudioCtx = null;
        }
        if (this.alarmInterval) {
            clearInterval(this.alarmInterval);
            this.alarmInterval = null;
        }
        document.body.classList.remove('alarm-active');
    },
    
    updateDisplay() {
        const remaining = timer.getRemaining();
        this.timerDisplay.textContent = timer.formatTime(remaining);
    },
    
    updatePresetIndicator() {
        this.presetIndicator.textContent = this.presets[this.currentPresetIndex];
    },
    
    updateOrientationIndicator(detail) {
        const degrees = Math.round(detail.rotation);
        
        const ball = document.getElementById('orientation-ball');
        const timerDisplay = document.getElementById('timer-display');
        const ring = document.getElementById('orientation-ring');
        if (ball) {
            const radius = 200;
            const rad = (degrees - 90) * (Math.PI / 180);
            const x = radius + radius * Math.cos(rad);
            const y = radius + radius * Math.sin(rad);
            ball.style.left = x + 'px';
            ball.style.top = y + 'px';
            ball.style.transform = 'translate(-50%, -50%)';
        }
        if (timerDisplay) {
            timerDisplay.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
        }
        if (ring) {
            ring.dataset.zone = detail.zone;
        }
    },
    
    updateDebugVisibility() {
        const debugOverlay = document.getElementById('debug-overlay');
        if (settings.isDebugEnabled()) {
            debugOverlay.classList.remove('hidden');
        } else {
            debugOverlay.classList.add('hidden');
        }
    },
    
    applySprites() {
        const sprites = storage.getSprites();
        
        if (sprites.timer_bg) {
            this.timerDisplay.style.backgroundImage = `url(${sprites.timer_bg})`;
            this.timerDisplay.style.backgroundSize = 'cover';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    settings.init();
    app.init();
    
    timer.setDuration(5);
    app.updateDisplay();
});
