const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let videoWindow;  // Variável global para a janela de vídeo

// Função para criar a janela principal
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
    icon: path.join(__dirname, 'assets/icons/app-icon.png'),  // Ícone personalizado
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// Função para criar a janela de vídeo
ipcMain.on('play-video', (event, url) => {
  const videoId = extractVideoId(url);  // Extrai o ID do vídeo do YouTube

  if (!videoId) {
    event.sender.send('video-error', 'Por favor, insira uma URL válida do YouTube.');
    return;
  }

  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(display => display.bounds.x !== 0 || display.bounds.y !== 0);

  if (externalDisplay) {
    videoWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload-video.js'),  // Carrega o script preload para expor o ipcRenderer
        nodeIntegration: false,  // Mantém a integração Node.js desativada
        contextIsolation: true,  // Mantém o isolamento de contexto para segurança
      },
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'assets/icons/video-icon.png'),  // Ícone personalizado
    });
  } else {
    videoWindow = new BrowserWindow({
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload-video.js'),  // Carrega o script preload para expor o ipcRenderer
        nodeIntegration: false,  // Mantém a integração Node.js desativada
        contextIsolation: true,  // Mantém o isolamento de contexto para segurança
      },
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'assets/icons/video-icon.png'),  // Ícone personalizado
    });
  }

  videoWindow.loadURL(`file://${__dirname}/video.html?video=${videoId}`);

  // Fechar a janela de vídeo ao receber o comando 'close-video'
  ipcMain.on('close-video', () => {
    if (videoWindow) {
      videoWindow.close();
    }
  });

  // Limpar a referência da janela quando for fechada
  videoWindow.on('closed', () => {
    videoWindow = null;
  });
});

// Função para extrair o ID do vídeo da URL
function extractVideoId(url) {
  const videoIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(videoIdRegex);
  return match ? match[1] : null;
}

// Evento para quando o app estiver pronto
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha o aplicativo no Windows e Linux quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
