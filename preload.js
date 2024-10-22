const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getApps: async () => ipcRenderer.invoke('get-active-apps'),
    saveData: (processData) => ipcRenderer.invoke('save-data-with-data', processData),
    loadData: () => ipcRenderer.invoke('load-data'),
    imageExists: (path) => ipcRenderer.invoke('image-exists', path),
    sendVariableToMain: (variable) => ipcRenderer.send('send-variable-to-main', variable),
    receiveRequestFromMain: (callback) => ipcRenderer.on('request-variable-from-renderer', callback),
    toggleRunOnStartup: async () => ipcRenderer.invoke('toggle-run-on-startup'),
    toggleStartMinimised: () => ipcRenderer.invoke('toggle-start-minimised'),
    toggleCloseToTray: () => ipcRenderer.invoke('toggle-close-to-tray'),
    getSettings: async () => ipcRenderer.invoke('get-settings'),
    setAccentColour: async (colour) => ipcRenderer.invoke('set-accent-colour', colour),
    getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),

    exportSettings: async () => ipcRenderer.invoke('export-settings'),
    clearIconCache: async () => ipcRenderer.invoke('clear-icon-cache'),
    factoryReset: () => ipcRenderer.invoke('factory-reset')
});