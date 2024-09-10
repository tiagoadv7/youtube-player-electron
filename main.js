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

  ipcMain.on('play-video', (event, url) => {
    const videoId = extractVideoId(url);  // Extrai o ID do vídeo do YouTube

    if (!videoId) {
      event.sender.send('video-error', 'Por favor, insira uma URL válida do YouTube.');
      return;
    }

    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find(display => display.bounds.x !== 0 || display.bounds.y !== 0);

    let videoWindow;

    if (externalDisplay) {
      videoWindow = new BrowserWindow({
        x: externalDisplay.bounds.x,
        y: externalDisplay.bounds.y,
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/icons/video-icon.png'),  // Ícone personalizado
      });
    } else {
      videoWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
          nodeIntegration: true,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets/icons/video-icon.png'),  // Ícone personalizado
      });
    }

    videoWindow.loadURL(`file://${__dirname}/video.html?video=${videoId}`);

    // Fechar o vídeo ao pressionar "Esc"
    ipcMain.on('close-video', () => {
      if (videoWindow) {
        videoWindow.close();
      }
    });
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
