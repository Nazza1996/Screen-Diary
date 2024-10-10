const path = require('path'); // Import Node.js path module
const os = require('os'); // Import Node.js os module
const ws = require('windows-shortcuts'); // Import windows-shortcuts module
const fs = require('fs'); // Import Node.js file system module
const Store = require('electron-store'); // Import electron-store module

const store = new Store(); // Initialize electron-store

// Function to initialize settings with default values if not already set
function initializeSettings() {
    if (store.get('runOnStartup') == undefined) {
        store.set('runOnStartup', false); // Set default value for runOnStartup
    }

    if (store.get('startMinimised') == undefined) {
        store.set('startMinimised', false); // Set default value for startMinimised
    }

    if (store.get('closeToTray') == undefined) {
        store.set('closeToTray', false); // Set default value for closeToTray
    }

    // Return the current settings
    return {
        runOnStartup: store.get('runOnStartup'),
        startMinimised: store.get('startMinimised'),
        closeToTray: store.get('closeToTray')
    };
}

// Function to toggle the run on startup setting
async function toggleRunOnStartup() {
    const startUpFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'); // Path to the startup folder
    const exePath = path.join(__dirname, '../../ScreenDiary.exe'); // Path to the executable
    const targetPath = path.join(startUpFolder, 'ScreenDiary.lnk'); // Path to the shortcut

    if (!fs.existsSync(targetPath)) {
        // Create a shortcut if it doesn't exist
        ws.create(targetPath, exePath, (err) => {
            if (err) {
                console.error('Failed to create shortcut: ', err); // Log any errors
            }
        });
        store.set('runOnStartup', true); // Update the setting to true
    } else {
        // Remove the shortcut if it exists
        fs.rmSync(targetPath);
        store.set('runOnStartup', false); // Update the setting to false
    }
}

// Function to toggle the start minimized setting
function toggleStartMinimised() {
    store.set('startMinimised', !store.get('startMinimised')); // Toggle the start minimized setting
}

// Function to toggle the close to tray setting
function toggleCloseToTray() {
    store.set('closeToTray', !store.get('closeToTray')); // Toggle the close to tray setting
}

// Export the functions for use in other modules
module.exports = { toggleRunOnStartup, initializeSettings, toggleStartMinimised, toggleCloseToTray };