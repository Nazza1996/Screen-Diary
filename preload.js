const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getApps: () => ipcRenderer.invoke('get-active-apps'),
    saveData: (processData) => ipcRenderer.invoke('save-data', processData),
    loadData: () => ipcRenderer.invoke('load-data')
});