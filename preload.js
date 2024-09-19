const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getApps: async () => ipcRenderer.invoke('get-active-apps'),
    saveData: (processData) => ipcRenderer.invoke('save-data', processData),
    loadData: () => ipcRenderer.invoke('load-data'),
    imageExists: (path) => ipcRenderer.invoke('image-exists', path)
});