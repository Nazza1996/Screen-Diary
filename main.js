const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getApps } = require('./getActiveApps.js');
const fs = require('fs');

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

    win.loadFile('index.html');
}

app.whenReady().then(createWindow, fs.mkdirSync('./icons'));

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