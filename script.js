const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

function startDraw(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = '#3399ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

document.getElementById('clearBtn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('feedBtn').addEventListener('click', feedCat);

function feedCat() {
  const fish = document.createElement('img');
  fish.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'; // placeholder
  fish.classList.add('fish');
  document.body.appendChild(fish);

  const cat = document.getElementById('cat');
  cat.style.transform = 'scale(1.1) rotate(3deg)';

  setTimeout(() => {
    fish.remove();
    cat.style.transform = 'scale(1) rotate(0deg)';
  }, 2000);
}
