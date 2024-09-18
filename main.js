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
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow, fs.mkdirSync('./icons'));

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // First, delete the folder, then quit the app
        fs.rm('./icons', { recursive: true, force: true }, (err) => {
            if (err) {
                throw err;
            }
            console.log('Folder deleted');
            app.quit(); // Quit after the folder is deleted
        });
    }
});

ipcMain.handle('get-active-apps', async () => {
    return await getApps();
});