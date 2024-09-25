const { app, BrowserWindow, ipcMain, Menu, Tray, contentTracing } = require('electron');
const path = require('path');
const { getApps, saveData, loadData, ifImageExists } = require('./getActiveApps.js');
const { toggleRunOnStartup, toggleStartMinimised, initializeSettings, toggleCloseToTray } = require('./settingsScripts.js');
const Store = require('electron-store');

let win = null;
function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            // devTools: false
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ececec',
            height: 40
        }
    });

    tray = new Tray(path.join(__dirname, "/assets/icon.png"));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Show Screen Diary', click: () => {
            win.show();
            win.focus();
        }},
        {type: 'separator'},
        {label: 'Quit', click: () => {
            win.webContents.send('request-variable-from-renderer');
            setTimeout(() => {
                saveData(currentAppData);
                win.destroy();
                app.quit();
            }, 1000);
        }}
    ]);

    tray.setToolTip('Screen Diary');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        win.show();
        win.focus();
    });

    // win.setMenuBarVisibility(false);
    
    win.loadFile('./index.html');

    win.on('close', function (event) {
        if (store.get('closeToTray') == true) {
            event.preventDefault();
            win.hide();
        }
    });


    win.on('close', () => {
        if (process.platform !== 'darwin') {
            win.webContents.send('request-variable-from-renderer');
        }
    });
}

const store = new Store();

app.whenReady().then(() => {
    createWindow();
    if (store.get('startMinimised') == true) {
        win.hide();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('get-active-apps', async () => {
    return await getApps();
});

ipcMain.handle('save-data-with-data', (event, processData) => {
    return saveData(processData);
});

ipcMain.handle('load-data', () => {
    return loadData();
});

ipcMain.handle('image-exists', (event, path) => {
    return ifImageExists(path);
});

let currentAppData = null;
ipcMain.on('send-variable-to-main', (event, variable) => {
    currentAppData = variable;
});

ipcMain.handle('toggle-run-on-startup', async () => {
    return await toggleRunOnStartup();
});

ipcMain.handle('toggle-start-minimised', () => {
    toggleStartMinimised();
});

ipcMain.handle('toggle-close-to-tray', () => {
    toggleCloseToTray();
});

ipcMain.handle('get-settings', async () => {
    return new Promise ((resolve, reject) => {
        resolve(initializeSettings());
    });
});