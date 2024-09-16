const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getApps: () => ipcRenderer.invoke('get-active-apps')
});