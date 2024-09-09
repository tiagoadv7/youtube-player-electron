const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icons/app-icon.png'),  // Ícone personalizado
  });

  mainWindow.loadFile('index.html');

  // Evento para abrir o vídeo em tela cheia
  ipcMain.on('play-video', (event, url) => {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find(display => display.bounds.x !== 0 || display.bounds.y !== 0);

    let videoWindow;

    // Se houver tela externa, exibe o vídeo nela em tela cheia
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
      // Caso contrário, exibe na tela primária em tela cheia
      videoWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/icons/video-icon.png'),  // Ícone personalizad
      });
    }

    // Carrega o HTML local e passa o ID do vídeo como parâmetro
    const videoId = extractVideoId(url);  // Extrai o ID do vídeo
    if (videoId) {
      videoWindow.loadURL(`file://${__dirname}/video.html?video=${videoId}`);
    } else {
      console.log("URL inválida");
    }
  });
}

// Função para extrair o ID do vídeo da URL
function extractVideoId(url) {
  const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(videoIdRegex);
  return match ? match[1] : null;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
