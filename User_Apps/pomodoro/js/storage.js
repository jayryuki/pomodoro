const STORAGE_KEYS = {
    PRESETS: 'pomodoro_presets',
    DEBUG: 'pomodoro_debug',
    UNLOCK_ROTATION: 'pomodoro_unlock_rotation',
    SPRITES: 'pomodoro_sprites'
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
        const stored = localStorage.getItem(STORAGE_KEYS.UNLOCK_ROTATION);
        return stored === null ? true : stored === 'true';
    },
    
    setRotationUnlocked(unlocked) {
        localStorage.setItem(STORAGE_KEYS.UNLOCK_ROTATION, unlocked);
    },
    
    getSprites() {
        const stored = localStorage.getItem(STORAGE_KEYS.SPRITES);
        return stored ? JSON.parse(stored) : {
            companion: null,
            timer_bg: null,
            icons: {}
        };
    },
    
    setSprite(key, value) {
        const sprites = this.getSprites();
        sprites[key] = value;
        localStorage.setItem(STORAGE_KEYS.SPRITES, JSON.stringify(sprites));
    },
    
    clearSprite(key) {
        const sprites = this.getSprites();
        delete sprites[key];
        localStorage.setItem(STORAGE_KEYS.SPRITES, JSON.stringify(sprites));
    }
};
