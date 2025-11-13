const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#fbbf24');
  gradient.addColorStop(1, '#f59e0b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('🎂', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

createIcon(192, 'icon-192.png');
createIcon(512, 'icon-512.png');
console.log('Icons created successfully!');
