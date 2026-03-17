const app = {
    presets: [5, 10, 30, 60],
    currentPresetIndex: 0,
    alarmSound: null,
    
    init() {
        this.presets = settings.getPresets();
        
        this.alarmSound = document.getElementById('alarm-sound');
        
        this.bindElements();
        this.bindEvents();
        this.initRotation();
        this.updateDisplay();
        this.updateDebugVisibility();
        
        window.addEventListener('settings-changed', () => {
            this.presets = settings.getPresets();
            this.updateDebugVisibility();
            this.updatePresetIndicator();
        });
        
        window.addEventListener('rotation-update', (e) => {
            if (settings.isDebugEnabled()) {
                document.getElementById('debug-rotation').textContent = 
                    Math.round(e.detail.rotation);
                document.getElementById('debug-zone').textContent = e.detail.zone;
            }
        });
    },
    
    bindElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.startBtn = document.getElementById('start-btn');
        this.presetIndicator = document.getElementById('current-preset');
    },
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
    },
    
    initRotation() {
        if (settings.isRotationUnlocked()) {
            rotation.unlock();
        }
        
        rotation.init((newZone, previousZone) => {
            const timerState = timer.getState();
            
            if (timerState === 'alarm') {
                rotation.unlock();
                this.stopAlarm();
                this.activatePreset(newZone);
                timer.start();
                this.startBtn.textContent = 'Stop';
                return;
            }
            
            if (rotation.isLocked() && !settings.isRotationUnlocked()) {
                return;
            }
            
            this.activatePreset(newZone);
        });
    },
    
    activatePreset(zoneIndex) {
        this.currentPresetIndex = zoneIndex;
        const presetMinutes = this.presets[zoneIndex];
        
        timer.setDuration(presetMinutes);
        this.updateDisplay();
        this.updatePresetIndicator();
    },
    
    toggleTimer() {
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
        rotation.lock();
    },
    
    stopTimer() {
        timer.stop();
        this.startBtn.textContent = 'Start';
    },
    
    stopAlarm() {
        this.alarmSound.pause();
        this.alarmSound.currentTime = 0;
        document.body.classList.remove('alarm-active');
    },
    
    updateDisplay() {
        const remaining = timer.getRemaining();
        this.timerDisplay.textContent = timer.formatTime(remaining);
    },
    
    updatePresetIndicator() {
        this.presetIndicator.textContent = this.presets[this.currentPresetIndex];
    },
    
    updateDebugVisibility() {
        const debugOverlay = document.getElementById('debug-overlay');
        if (settings.isDebugEnabled()) {
            debugOverlay.classList.remove('hidden');
        } else {
            debugOverlay.classList.add('hidden');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    settings.init();
    app.init();
    
    timer.setDuration(5);
    app.updateDisplay();
});
