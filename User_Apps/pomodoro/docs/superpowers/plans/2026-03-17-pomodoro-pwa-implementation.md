# Pomodoro PWA Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PWA pomodoro app where phone rotation selects timer presets (5/10/30/60 min), with timer countdown, alarm, and rotation lock.

**Architecture:** Single-page PWA with Vanilla JS, LocalStorage for persistence, DeviceOrientationEvent for rotation detection.

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Service Worker for PWA offline support

---

## File Structure

```
/home/jay/User_Apps/pomodoro/
├── index.html          # Main app shell
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Main app logic and state machine
│   ├── rotation.js    # Rotation detection and zone calculation
│   ├── timer.js       # Timer countdown logic
│   ├── storage.js     # LocalStorage persistence
│   └── settings.js    # Settings UI and management
├── sounds/
│   └── alarm.mp3      # Alarm sound
├── manifest.json      # PWA manifest
└── sw.js             # Service worker
```

---

## Task 1: Project Setup & PWA Shell

**Files:**
- Create: `index.html`
- Create: `manifest.json`
- Create: `sw.js`
- Create: `css/style.css`

- [ ] **Step 1: Create index.html with app structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1a1a2e">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Pomodoro Rotate</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <div id="debug-overlay" class="hidden">
            <div>Rotation: <span id="debug-rotation">0</span>°</div>
            <div>Zone: <span id="debug-zone">0</span></div>
        </div>
        
        <div id="preset-indicator">Preset: <span id="current-preset">5</span> min</div>
        
        <div id="timer-display">05:00</div>
        
        <button id="start-btn">Start</button>
        
        <button id="settings-btn" aria-label="Settings">⚙</button>
    </div>
    
    <div id="settings-modal" class="hidden">
        <h2>Settings</h2>
        <label>
            <input type="checkbox" id="debug-toggle">
            Show Debug Info
        </label>
        <label>
            <input type="checkbox" id="unlock-rotation-toggle">
            Unlock Rotation (allow changes while running)
        </label>
        <div id="presets-editor">
            <h3>Presets (minutes)</h3>
            <input type="number" id="preset-1" value="5" min="1">
            <input type="number" id="preset-2" value="10" min="1">
            <input type="number" id="preset-3" value="30" min="1">
            <input type="number" id="preset-4" value="60" min="1">
        </div>
        <button id="save-settings">Save</button>
        <button id="close-settings">Close</button>
    </div>
    
    <audio id="alarm-sound" src="sounds/alarm.mp3" loop></audio>
    
    <script src="js/storage.js"></script>
    <script src="js/rotation.js"></script>
    <script src="js/timer.js"></script>
    <script src="js/settings.js"></script>
    <script src="js/app.js"></script>
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js');
        }
    </script>
</body>
</html>
```

- [ ] **Step 2: Create manifest.json**

```json
{
    "name": "Pomodoro Rotate",
    "short_name": "Pomodoro",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a2e",
    "theme_color": "#1a1a2e",
    "orientation": "portrait",
    "icons": [
        {
            "src": "icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

- [ ] **Step 3: Create sw.js for offline support**

```javascript
const CACHE_NAME = 'pomodoro-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/rotation.js',
    '/js/timer.js',
    '/js/storage.js',
    '/js/settings.js',
    '/sounds/alarm.mp3',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
```

- [ ] **Step 4: Create css/style.css**

```css
:root {
    --bg-color: #1a1a2e;
    --text-color: #eee;
    --accent-color: #e94560;
    --secondary-color: #16213e;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-color);
    color: var(--text-color);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

#app {
    text-align: center;
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

#debug-overlay {
    position: fixed;
    top: 10px;
    left: 10px;
    font-size: 12px;
    opacity: 0.7;
    font-family: monospace;
}

#debug-overlay.hidden {
    display: none;
}

#preset-indicator {
    font-size: 1.2rem;
    margin-bottom: 20px;
    opacity: 0.8;
}

#timer-display {
    font-size: 5rem;
    font-weight: bold;
    margin: 40px 0;
    font-variant-numeric: tabular-nums;
}

#start-btn {
    font-size: 1.5rem;
    padding: 15px 50px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.1s;
}

#start-btn:active {
    transform: scale(0.95);
}

#settings-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.6;
}

#settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 100;
}

#settings-modal.hidden {
    display: none;
}

#settings-modal label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
}

#presets-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

#presets-editor input {
    padding: 10px;
    font-size: 1rem;
    width: 100px;
    text-align: center;
}

#settings-modal button {
    padding: 10px 30px;
    font-size: 1rem;
    cursor: pointer;
}

.alarm-active {
    animation: pulse 0.5s infinite alternate;
}

@keyframes pulse {
    from { opacity: 1; }
    to { opacity: 0.5; }
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: create PWA shell with HTML, CSS, manifest, service worker"
```

---

## Task 2: Storage Module

**Files:**
- Create: `js/storage.js`

- [ ] **Step 1: Write storage.js with LocalStorage operations**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add js/storage.js
git commit -m "feat: add storage module for LocalStorage persistence"
```

---

## Task 3: Rotation Detection

**Files:**
- Create: `js/rotation.js`

- [ ] **Step 1: Write rotation.js with DeviceOrientationEvent handling**

```javascript
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
            // iOS 13+ requires permission
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
            
            // Handle wrap-around at ±90
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
        
        // Dispatch debug event
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
```

- [ ] **Step 2: Commit**

```bash
git add js/rotation.js
git commit -m "feat: add rotation detection with zone calculation"
```

---

## Task 4: Timer Module

**Files:**
- Create: `js/timer.js`

- [ ] **Step 1: Write timer.js with countdown logic**

```javascript
const timer = {
    duration: 0,
    remaining: 0,
    intervalId: null,
    state: 'stopped', // stopped, running, alarm
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
```

- [ ] **Step 2: Commit**

```bash
git add js/timer.js
git commit -m "feat: add timer module with countdown logic"
```

---

## Task 5: Settings Module

**Files:**
- Create: `js/settings.js`

- [ ] **Step 1: Write settings.js with settings UI logic**

```javascript
const settings = {
    modal: null,
    debugToggle: null,
    unlockRotationToggle: null,
    presetInputs: [],
    saveBtn: null,
    closeBtn: null,
    
    init() {
        this.modal = document.getElementById('settings-modal');
        this.debugToggle = document.getElementById('debug-toggle');
        this.unlockRotationToggle = document.getElementById('unlock-rotation-toggle');
        this.saveBtn = document.getElementById('save-settings');
        this.closeBtn = document.getElementById('close-settings');
        
        this.presetInputs = [
            document.getElementById('preset-1'),
            document.getElementById('preset-2'),
            document.getElementById('preset-3'),
            document.getElementById('preset-4')
        ];
        
        this.loadSettings();
        this.bindEvents();
    },
    
    loadSettings() {
        const presets = storage.getPresets();
        this.presetInputs.forEach((input, i) => {
            input.value = presets[i];
        });
        
        this.debugToggle.checked = storage.getDebugEnabled();
        this.unlockRotationToggle.checked = storage.getRotationUnlocked();
    },
    
    bindEvents() {
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.loadSettings();
            this.modal.classList.remove('hidden');
        });
        
        this.closeBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
        });
        
        this.saveBtn.addEventListener('click', () => {
            const presets = this.presetInputs.map(input => parseInt(input.value) || 5);
            storage.setPresets(presets);
            storage.setDebugEnabled(this.debugToggle.checked);
            storage.setRotationUnlocked(this.unlockRotationToggle.checked);
            
            window.dispatchEvent(new CustomEvent('settings-changed'));
            this.modal.classList.add('hidden');
        });
    },
    
    getPresets() {
        return storage.getPresets();
    },
    
    isDebugEnabled() {
        return storage.getDebugEnabled();
    },
    
    isRotationUnlocked() {
        return storage.getRotationUnlocked();
    }
};
```

- [ ] **Step 2: Commit**

```bash
git add js/settings.js
git commit -m "feat: add settings module for presets and debug toggle"
```

---

## Task 6: Main App Logic

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Write app.js integrating all modules**

```javascript
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
        // Apply settings preference on init
        if (settings.isRotationUnlocked()) {
            rotation.unlock();
        }
        
        rotation.init((newZone, previousZone) => {
            const timerState = timer.getState();
            
            // If alarm is playing, rotating stops alarm and starts new timer
            // Rotation is explicitly unlocked when alarm triggers (per spec)
            if (timerState === 'alarm') {
                rotation.unlock();  // Ensure rotation is unlocked for alarm state
                this.stopAlarm();
                this.activatePreset(newZone);
                timer.start();
                this.startBtn.textContent = 'Stop';
                // rotation stays unlocked for alarm state
                return;
            }
            
            // If rotation is locked and not unlocked in settings, ignore
            if (rotation.isLocked() && !settings.isRotationUnlocked()) {
                return;
            }
            
            // Normal preset change
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

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    settings.init();
    app.init();
    
    // Set initial timer
    timer.setDuration(5);
    app.updateDisplay();
});
```

- [ ] **Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: add main app logic integrating all modules"
```

---

## Task 7: Add Alarm Sound

**Files:**
- Create: `sounds/alarm.mp3`

- [ ] **Step 1: Add a real alarm sound file**

Download a free alarm sound (e.g., from freesound.org) and save as `sounds/alarm.mp3`. The app expects this file to exist and contain a valid audio file. Without it, the alarm will not play.

Example sources:
- freesound.org
- soundbible.com

```bash
mkdir -p sounds
# After downloading alarm.mp3:
# cp ~/Downloads/alarm.mp3 sounds/
```

- [ ] **Step 2: Commit**

```bash
git add sounds/
git commit -m "feat: add alarm sound"
```

---

## Task 8: Sprite System (User-Requested)

**Files:**
- Modify: `js/storage.js`
- Modify: `js/app.js`
- Modify: `index.html`
- Modify: `js/settings.js`

- [ ] **Step 1: Extend storage.js for sprite assets**

Add to `js/storage.js`:

```javascript
const STORAGE_KEYS = {
    PRESETS: 'pomodoro_presets',
    DEBUG: 'pomodoro_debug',
    UNLOCK_ROTATION: 'pomodoro_unlock_rotation',
    SPRITES: 'pomodoro_sprites'  // NEW
};

const storage = {
    // ... existing methods ...
    
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
```

- [ ] **Step 2: Add sprite upload UI to settings modal**

Add to `index.html` inside `#settings-modal`:

```html
<div id="sprites-editor">
    <h3>Custom Sprites</h3>
    <label>
        Companion Image:
        <input type="file" id="sprite-companion" accept="image/*">
    </label>
    <label>
        Timer Background:
        <input type="file" id="sprite-timer-bg" accept="image/*">
    </label>
    <div id="current-sprites"></div>
</div>
```

- [ ] **Step 3: Handle sprite uploads in settings.js**

```javascript
handleSpriteUpload(inputId, spriteKey) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                storage.setSprite(spriteKey, event.target.result);
                window.dispatchEvent(new CustomEvent('sprites-changed'));
            };
            reader.readAsDataURL(file);
        }
    });
},

initSprites() {
    this.handleSpriteUpload('sprite-companion', 'companion');
    this.handleSpriteUpload('sprite-timer-bg', 'timer_bg');
},
```

- [ ] **Step 4: Apply sprites in app.js**

```javascript
applySprites() {
    const sprites = storage.getSprites();
    
    // Apply companion if set
    if (sprites.companion) {
        const img = new Image();
        img.src = sprites.companion;
        // Append to app or replace existing companion element
    }
    
    // Apply timer background if set
    if (sprites.timer_bg) {
        this.timerDisplay.style.backgroundImage = `url(${sprites.timer_bg})`;
        this.timerDisplay.style.backgroundSize = 'cover';
    }
},
```

- [ ] **Step 5: Commit**

```bash
git add js/storage.js js/app.js index.html js/settings.js
git commit -m "feat: add sprite system for customizable UI"
```

---

## Task 9: Test & Verify

**Files:**
- Test: All created files

- [ ] **Step 1: Create a simple test to verify rotation zone calculation**

```javascript
// Add to rotation.js or create separate test
// Test zone calculation:
// accumulatedRotation 0-89 -> zone 0
// accumulatedRotation 90-179 -> zone 1
// accumulatedRotation 180-269 -> zone 2
// accumulatedRotation 270-359 -> zone 3
// accumulatedRotation 360-449 -> zone 0 (wraps)

console.log('Zone tests:', 
    Math.floor(0 / 90) % 4,     // 0
    Math.floor(45 / 90) % 4,    // 0
    Math.floor(90 / 90) % 4,    // 1
    Math.floor(180 / 90) % 4,   // 2
    Math.floor(270 / 90) % 4,   // 3
    Math.floor(360 / 90) % 4    // 0 (wraps)
);
```

- [ ] **Step 2: Verify the app loads in browser**

Open `index.html` in a browser (use a mobile device or DevTools device emulation). Test:
1. Timer displays correctly
2. Start button starts countdown
3. Stop button stops countdown
4. Settings modal opens/closes
5. Debug toggle shows/hides rotation values

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: complete pomodoro PWA with all features"
```

---

## Task 10: Add PWA Icons

**Files:**
- Create: `icons/icon-192.png`, `icons/icon-512.png`

- [ ] **Step 1: Create PWA icons**

PWA requires icons for installation. Create or download icons:
- 192x192px for `icons/icon-192.png`
- 512x512px for `icons/icon-512.png`

```bash
mkdir -p icons
# After creating/downloading icons:
# cp ~/Downloads/icon-192.png icons/
# cp ~/Downloads/icon-512.png icons/
```

- [ ] **Step 2: Commit**

```bash
git add icons/
git commit -m "feat: add PWA icons"
