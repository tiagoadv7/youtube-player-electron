const { ipcRenderer } = require('electron');

// Função para verificar se a URL é válida (do YouTube)
function isValidYouTubeUrl(url) {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  return youtubeRegex.test(url);
}

// Função para reproduzir o vídeo
document.getElementById('playBtn').addEventListener('click', () => {
  const urlInput = document.getElementById('urlInput').value.trim();

 // Verifica se a URL está vazia
 if (!urlInput) {
  displayError('Por favor, insira uma URL.');
  return;
}

// Verifica se a URL é válida (do YouTube)
if (!isValidYouTubeUrl(urlInput)) {
  displayError('Insira uma URL válida do YouTube.');
  // Limpa o campo de input após inserir uma URL inválida
  document.getElementById('urlInput').value = '';
  return;
}

  // Envia a URL para o processo principal se estiver preenchida e válida
  ipcRenderer.send('play-video', urlInput);

  // Limpa o campo de input
  document.getElementById('urlInput').value = '';
});

// Função para exibir mensagens de erro com fade
function displayError(message) {
  const errorElement = document.getElementById('error-alert');
  errorElement.textContent = message;

  // Mostra o alerta com fade-in
  errorElement.style.display = 'block';
  errorElement.style.opacity = 0;
  setTimeout(() => {
    errorElement.style.opacity = 1;
  }, 100);

  // Remove o alerta após 3 segundos com fade-out
  setTimeout(() => {
    errorElement.style.opacity = 0;
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 700);  // Tempo do fade-out
  }, 3000);
}

// Verifica se a tecla "Enter" foi pressionada no campo de input
document.getElementById('urlInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('playBtn').click();
  }
});

// Detecta quando a tecla "Esc" é pressionada e envia a mensagem para fechar a segunda janela
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ipcRenderer.send('close-video'); // Envia uma mensagem para o processo principal fechar a janela de vídeo
  }
});
