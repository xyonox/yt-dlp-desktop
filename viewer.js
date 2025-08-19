const { ipcRenderer } = require('electron');
const path = require('path');

let images = [];
let current = 0;

// Elemente
const thumbsContainer = document.getElementById('thumbnails');
const viewer = document.getElementById('viewer');
const currentImage = document.getElementById('current-image');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const backBtn = document.getElementById('back-button');

// Request images vom Main
ipcRenderer.send('request-images');

// Liste von WebP-Dateien empfangen
ipcRenderer.on('load-images', (event, files) => {
  images = files;
  thumbsContainer.innerHTML = '';
  files.forEach((file, index) => {
    const img = document.createElement('img');
    img.src = 'file://' + file; // <-- wichtig: file:// davor
    img.classList.add('thumb');
    img.addEventListener('click', () => {
      current = index;
      showViewer();
    });
    thumbsContainer.appendChild(img);
  });
});

function showViewer() {
  thumbsContainer.style.display = 'none';
  viewer.style.display = 'block';
  showImage();
}

function showImage() {
  if(images.length === 0) return;
  currentImage.src = 'file://' + images[current]; // <-- file:// hinzufügen
}

prevBtn.addEventListener('click', () => {
  if(images.length === 0) return;
  current = (current - 1 + images.length) % images.length;
  showImage();
});

nextBtn.addEventListener('click', () => {
  if(images.length === 0) return;
  current = (current + 1) % images.length;
  showImage();
});

backBtn.addEventListener('click', () => {
  viewer.style.display = 'none';
  thumbsContainer.style.display = 'flex';
});