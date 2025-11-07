(async function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";

  // ✅ วาดได้ทั้งคอมและมือถือ
  canvas.addEventListener("mousedown", (e) => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
  canvas.addEventListener("mousemove", (e) => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.strokeStyle = currentColor; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke(); }});
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseleave", () => drawing = false);
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
  });
  canvas.addEventListener("touchend", () => drawing = false);

  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.getAttribute("data-color");
      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

  // 🧠 ตรวจว่าคล้ายปลา
  async function checkIfFish(imageData) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        const tmp = document.createElement("canvas");
        const tctx = tmp.getContext("2d");
        tmp.width = img.width;
        tmp.height = img.height;
        tctx.drawImage(img, 0, 0);
        const d = tctx.getImageData(0, 0, tmp.width, tmp.height);
        const points = [];
        for (let y = 0; y < tmp.height; y++) for (let x = 0; x < tmp.width; x++) {
          const a = d.data[(y * tmp.width + x) * 4 + 3];
          if (a > 100) points.push({ x, y });
        }
        if (points.length < 150) return resolve(false);
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const ratio = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys));
        resolve(ratio > 1.2 && ratio < 3.8);
      };
    });
  }

  const fishContainer = document.getElementById("fishContainer");

  function addFishToAquarium(imageData) {
    const fish = document.createElement("img");
    fish.src = imageData;
    fish.classList.add("fish");
    fish.style.top = 50 + Math.random() * 45 + "%";
    fish.style.left = 10 + Math.random() * 70 + "%";
    fishContainer.appendChild(fish);

    function swim() {
      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      const duration = 7000 + Math.random() * 4000;
      const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out, transform 1s ease`;
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      fish.style.transform = flip;
      setTimeout(swim, duration);
    }

    // 🩵 แตะแล้วว่ายเร็ว
    fish.addEventListener("click", () => {
      fish.style.transition = `top 2000ms ease-in-out, left 2000ms ease-in-out, transform 0.5s ease`;
      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      setTimeout(() => fish.style.transition = "top 8s ease-in-out, left 8s ease-in-out, transform 1s ease", 2000);
    });

    setTimeout(swim, 1000 + Math.random() * 2000);
  }

  document.getElementById("feedBtn").addEventListener("click", async () => {
    const img = canvas.toDataURL("image/png");
    const isFish = await checkIfFish(img);
    if (!isFish) { alert("That’s not a fish 🐱💬"); return; }
    addFishToAquarium(img);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
})();
