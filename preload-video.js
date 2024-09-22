const { contextBridge, ipcRenderer } = require('electron');

// Expõe o ipcRenderer ao contexto do navegador de maneira segura
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data)
});
