const { ipcRenderer } = require('electron');

const output = document.getElementById("output");
const folderDisplay = document.getElementById("folderDisplay");

// Download-Ordner beim Start anzeigen
const savedPath = localStorage.getItem('downloadPath');
if(savedPath) folderDisplay.textContent = savedPath;

document.getElementById("download").addEventListener("click", () => {
  const url = document.getElementById("url").value;
  if(!url) return alert("Bitte URL eingeben!");
  ipcRenderer.send("download-video", url);
});

document.getElementById("chooseFolder").addEventListener("click", async () => {
  const path = await ipcRenderer.invoke("choose-folder");
  if(path) {
    folderDisplay.textContent = path;
    localStorage.setItem('downloadPath', path);
  }
});

ipcRenderer.on("download-progress", (event, data) => {
  if(data.trim().startsWith("Download beendet")) {
    output.textContent = data + "\n" + output.textContent;
  } else {
    output.textContent = data + "\n" + output.textContent;
  }
  output.scrollTop = output.scrollHeight;
});