const path = require('path');
const os = require('os');
const ws = require('windows-shortcuts')
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

function initializeSettings() {
    if (store.get('runOnStartup') == undefined) {
        store.set('runOnStartup', false);
    }

    if (store.get('startMinimised') == undefined) {
        store.set('startMinimised', false);
    }

    if (store.get('closeToTray') == undefined) {
        store.set('closeToTray', false);
    }

    return {
        runOnStartup: store.get('runOnStartup'),
        startMinimised: store.get('startMinimised'),
        closeToTray: store.get('closeToTray')
    };
}

async function toggleRunOnStartup() {
    const startUpFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const exePath = path.join(__dirname, '../../ScreenDiary.exe');
    const targetPath = path.join(startUpFolder, 'ScreenDiary.lnk');
    
    if (!fs.existsSync(targetPath)) {
        ws.create(targetPath, exePath, (err) => {
            if (err) {
                console.error('Failed to create shortcut: ', err);
            }
        });
        store.set('runOnStartup', true);
    } else {
        fs.rmSync(targetPath);
        store.set('runOnStartup', false);
    }
}

function toggleStartMinimised() {
    store.set('startMinimised', !store.get('startMinimised'));
}

function toggleCloseToTray() {
    store.set('closeToTray', !store.get('closeToTray'));
}


module.exports = { toggleRunOnStartup, initializeSettings, toggleStartMinimised, toggleCloseToTray };