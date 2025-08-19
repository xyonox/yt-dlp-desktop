const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const Store = require('electron-store').default;

// main.js
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 350,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

ipcMain.on("open-viewer", (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.loadFile("viewer.html");
  }
});

ipcMain.on("back-to-downloads", (event) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.loadFile("index.html");
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// Download-Ordner setzen / ändern
ipcMain.handle("choose-folder", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if(canceled) return null;

  const downloadPath = filePaths[0];
  store.set('downloadPath', downloadPath);
  return downloadPath;
});

// Download starten
ipcMain.on("download-video", (event, url) => {
  let downloadPath = store.get('downloadPath') || app.getPath('downloads'); // Standard: Downloads

  const outputTemplate = path.join(downloadPath, "%(title)s.%(ext)s");

  const yt = spawn("yt-dlp", ["--cookies-from-browser", "chrome" ,"-f", "best", "-o", outputTemplate, url]);

  yt.stdout.on("data", (data) => {
    event.sender.send("download-progress", data.toString());
  });

  yt.stderr.on("data", (data) => {
    event.sender.send("download-progress", "ERROR: " + data.toString());
  });

  yt.on("close", (code) => {
    event.sender.send("download-progress", `Download beendet (Code ${code})`);
  });
});