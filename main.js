const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Carrega o script renderer
      nodeIntegration: true,
      contextIsolation: false, // Permite comunicação entre processos
    },
    autoHideMenuBar: true, // Esconde a barra de menu
  });

  mainWindow.loadFile('index.html'); // Carrega a interface principal (index.html)

  // Evento para abrir o vídeo em tela cheia
  ipcMain.on('play-video', (event, url) => {
    const displays = screen.getAllDisplays(); // Pega todas as telas disponíveis
    const externalDisplay = displays.find(display => display.bounds.x !== 0 || display.bounds.y !== 0); // Verifica se há tela externa

    let videoWindow;

    // Se houver tela externa, exibe o vídeo nela em tela cheia
    if (externalDisplay) {
      videoWindow = new BrowserWindow({
        x: externalDisplay.bounds.x,
        y: externalDisplay.bounds.y,
        fullscreen: true, // Garante tela cheia
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true, // Esconde a barra de menu
      });
    } else {
      // Caso contrário, exibe na tela primária em tela cheia
      videoWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true, // Esconde a barra de menu
      });
    }

    videoWindow.loadURL(url); // Carrega o vídeo do YouTube
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(); // Garante que a janela é criada se o app estiver ativo
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit(); // Fecha o app quando todas as janelas forem fechadas, exceto no Mac
});
