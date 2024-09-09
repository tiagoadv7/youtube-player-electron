const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadFile('index.html');

  ipcMain.on('play-video', (event, videoId) => {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find(display => display.bounds.x !== 0 || display.bounds.y !== 0);
    
    let videoWindow;

    // Exibir o vídeo em fullscreen na tela externa ou principal
    if (externalDisplay) {
      videoWindow = new BrowserWindow({
        x: externalDisplay.bounds.x,
        y: externalDisplay.bounds.y,
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true,
      });
    } else {
      videoWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true,
      });
    }

    // Carrega o HTML para exibir o vídeo usando a API do YouTube
    videoWindow.loadFile('video.html');

    // Envia o ID do vídeo para a janela que vai carregá-lo
    videoWindow.webContents.once('did-finish-load', () => {
      videoWindow.webContents.send('load-video', videoId);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
