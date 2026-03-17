const STORAGE_KEYS = {
    PRESETS: 'pomodoro_presets',
    DEBUG: 'pomodoro_debug',
    UNLOCK_ROTATION: 'pomodoro_unlock_rotation'
};

const DEFAULT_PRESETS = [5, 10, 30, 60];

const storage = {
    getPresets() {
        const stored = localStorage.getItem(STORAGE_KEYS.PRESETS);
        return stored ? JSON.parse(stored) : [...DEFAULT_PRESETS];
    },
    
    setPresets(presets) {
        localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    },
    
    getDebugEnabled() {
        return localStorage.getItem(STORAGE_KEYS.DEBUG) === 'true';
    },
    
    setDebugEnabled(enabled) {
        localStorage.setItem(STORAGE_KEYS.DEBUG, enabled);
    },
    
    getRotationUnlocked() {
        return localStorage.getItem(STORAGE_KEYS.UNLOCK_ROTATION) === 'true';
    },
    
    setRotationUnlocked(unlocked) {
        localStorage.setItem(STORAGE_KEYS.UNLOCK_ROTATION, unlocked);
    }
};
