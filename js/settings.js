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
