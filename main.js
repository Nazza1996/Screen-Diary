const { app, BrowserWindow, ipcMain, Menu, Tray, contentTracing } = require('electron');
const path = require('path');
const { getApps, saveData, loadData } = require('./getActiveApps.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: true
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ececec',
            height: 40
        }
    });

    tray = new Tray('./icons/electron.png');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Show Screen Time', click: () => {
            win.show();
            win.focus();
        }},
        {type: 'separator'},
        {label: 'Quit', click: app.quit}
    ]);
    tray.setToolTip('Screen Time');
    tray.setContextMenu(contextMenu);

    win.setMenuBarVisibility(false);
    
    win.loadFile('index.html');

    win.hide();
}

let tray = null;

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('get-active-apps', async () => {
    return await getApps();
});

ipcMain.handle('save-data', (event, processData) => {
    return saveData(processData);
})

ipcMain.handle('load-data', () => {
    return loadData();
})