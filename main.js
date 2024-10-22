const { app, BrowserWindow, ipcMain, Menu, Tray, contentTracing } = require('electron'); // Import Electron modules
const path = require('path'); // Import Node.js path module
const { getApps, saveData, loadData, ifImageExists } = require('./getActiveApps.js'); // Import functions from getActiveApps.js
const { toggleRunOnStartup, toggleStartMinimised, initializeSettings, toggleCloseToTray,
    exportSettings, clearIconCache, factoryReset
} = require('./settingsScripts.js'); // Import functions from settingsScripts.js
const Store = require('electron-store'); // Import electron-store module

let win = null; // Initialize the main window variable

// Ensure only a single instance of the application is running
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit(); // Quit if another instance is already running
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) {
                win.restore(); // Restore the window if it is minimized
            }
            win.show(); // Show the window
            win.focus(); // Focus the window
        }
    });
}

// Function to create the main application window
function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script
            contextIsolation: true, // Enable context isolation
            enableRemoteModule: false, // Disable remote module
            nodeIntegration: false, // Disable Node.js integration
            devTools: false // Disable developer tools
        },
        titleBarStyle: 'hidden', // Hide the title bar
        titleBarOverlay: {
            color: '#ececec', // Set the title bar overlay color
            height: 40 // Set the title bar overlay height
        }
    });

    // Create a system tray icon
    tray = new Tray(path.join(__dirname, "/assets/icon.png"));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Show Screen Diary', click: () => {
            win.show(); // Show the window
            win.focus(); // Focus the window
        }},
        {type: 'separator'},
        {label: 'Quit', click: () => {
            win.webContents.send('request-variable-from-renderer'); // Request variable from renderer
            setTimeout(() => {
                saveData(currentAppData); // Save the current app data
                win.destroy(); // Destroy the window
                app.quit(); // Quit the application
            }, 1000); // Delay to ensure data is saved
        }}
    ]);

    tray.setToolTip('Screen Diary'); // Set the tray tooltip
    tray.setContextMenu(contextMenu); // Set the tray context menu
    tray.on('click', () => {
        win.show(); // Show the window on tray icon click
        win.focus(); // Focus the window on tray icon click
    });

    win.setMenuBarVisibility(false); // Hide the menu bar
    
    win.loadFile('./index.html'); // Load the main HTML file

    // Handle window close event for non-macOS platforms
    win.on('close', () => {
        if (process.platform !== 'darwin') {
            win.webContents.send('request-variable-from-renderer'); // Request variable from renderer
        }
    });
}

const store = new Store(); // Initialize electron-store

// When the application is ready, create the main window
app.whenReady().then(() => {
    createWindow();
    if (store.get('startMinimised') == true) {
        win.hide(); // Hide the window if startMinimised setting is true
    }
});

// Quit the application when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit(); // Quit the application
    }
});

// Handle IPC requests from the renderer process
ipcMain.handle('get-active-apps', async () => {
    return await getApps(); // Return the active apps
});

ipcMain.handle('save-data-with-data', (event, processData) => {
    return saveData(processData); // Save the provided data
});

ipcMain.handle('load-data', () => {
    return loadData(); // Load the saved data
});

ipcMain.handle('image-exists', (event, path) => {
    return ifImageExists(path); // Check if the image exists
});

let currentAppData = null; // Initialize the current app data variable
ipcMain.on('send-variable-to-main', (event, variable) => {
    currentAppData = variable; // Update the current app data
});

ipcMain.handle('toggle-run-on-startup', async () => {
    return await toggleRunOnStartup(); // Toggle the run on startup setting
});

ipcMain.handle('toggle-start-minimised', () => {
    toggleStartMinimised(); // Toggle the start minimized setting
});

ipcMain.handle('toggle-close-to-tray', () => {
    toggleCloseToTray(); // Toggle the close to tray setting
});

ipcMain.handle('get-settings', async () => {
    return new Promise ((resolve, reject) => {
        resolve(initializeSettings()); // Initialize and return the settings
    });
});

ipcMain.handle('set-accent-colour', async (event, colour) => {
    store.set('accentColour', colour); // Set the accent colour
});

ipcMain.handle('get-store-value', async (event, key) => {
    return store.get(key); // Get the value from the store
});

ipcMain.handle('export-settings', async (event) => {
    return await exportSettings(); // Export the settings
});

ipcMain.handle('clear-icon-cache', async (event) => {
    return clearIconCache(); // Export the settings
});

ipcMain.handle('factory-reset', () => {
    return factoryReset(); // Factory reset the application
});