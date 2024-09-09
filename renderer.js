const { ipcRenderer } = require('electron');

document.getElementById('playBtn').addEventListener('click', () => {
  const urlInput = document.getElementById('urlInput').value;

  // Verifica se a URL está vazia
  if (!urlInput) {
    // Exibe o alerta de erro
    document.getElementById('error-alert').style.display = 'block';

    // Remove o alerta após 3 segundos
    setTimeout(() => {
      document.getElementById('error-alert').style.display = 'none';
    }, 3000);
  } else {
    // Envia a URL para o processo principal se estiver preenchida
    ipcRenderer.send('play-video', urlInput);
    
    // Limpa o campo de input
    document.getElementById('urlInput').value = '';
  }
});

document.getElementById('urlInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('playBtn').click();
  }
});
