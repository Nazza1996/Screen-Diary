const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getApps } = require('./getActiveApps.js');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('get-active-apps', async() => {
    return await getApps();
})