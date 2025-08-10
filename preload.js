// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    generateWallets: (options) => ipcRenderer.invoke('generate-wallets', options),
    onProgress: (callback) => ipcRenderer.on('generation-progress', (event, ...args) => callback(...args))
});