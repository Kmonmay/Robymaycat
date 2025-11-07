(async function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = "#000000";

  const db = window.db;
  const dbRef = window.firebaseRef(db, "fishes");

  // วาด
  canvas.addEventListener("mousedown", e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
  canvas.addEventListener("mousemove", e => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.strokeStyle = currentColor; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke(); }});
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseleave", () => drawing = false);
  canvas.addEventListener("touchstart", e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); const t = e.touches[0]; drawing = true; ctx.beginPath(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); });
  canvas.addEventListener("touchmove", e => { e.preventDefault(); if (!drawing) return; const r = canvas.getBoundingClientRect(); const t = e.touches[0]; ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.strokeStyle = currentColor; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke(); });
  canvas.addEventListener("touchend", () => drawing = false);

  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentColor = btn.getAttribute("data-color");
      document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

  const fishContainer = document.getElementById("fishContainer");

  // 🐟 เพิ่มปลาในตู้
  function addFish(image) {
    const fish = document.createElement("img");
    fish.src = image;
    fish.classList.add("fish");
    fish.style.top = 50 + Math.random() * 45 + "%";
    fish.style.left = 10 + Math.random() * 70 + "%";
    fishContainer.appendChild(fish);

    const swim = () => {
      const randomX = 10 + Math.random() * 80;
      const randomY = 50 + Math.random() * 45;
      const duration = 7000 + Math.random() * 4000;
      const flip = Math.random() < 0.5 ? "scaleX(1)" : "scaleX(-1)";
      fish.style.transition = `top ${duration}ms ease-in-out, left ${duration}ms ease-in-out, transform 1s ease`;
      fish.style.top = `${randomY}%`;
      fish.style.left = `${randomX}%`;
      fish.style.transform = flip;
      setTimeout(swim, duration);
    };
    setTimeout(swim, 1000);
  }

// 🧠 ตรวจว่ารูปคล้ายปลา (ฉลาดพอดี เวอร์ชันสมดุล)
async function checkIfFish(imageData) {
  return new Promise((resolve) => {
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
      for (let y = 0; y < tmp.height; y++) {
        for (let x = 0; x < tmp.width; x++) {
          const a = d.data[(y * tmp.width + x) * 4 + 3];
          if (a > 100) points.push({ x, y });
        }
      }

      if (points.length < 150) return resolve(false); // ต้องมีเส้นเพียงพอ

      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      const ratio = w / h;
      const density = points.length / (w * h);

      // ✅ เงื่อนไข "สมดุล" สำหรับรูปร่างปลา
      // ยาวกว่าเล็กน้อย, ไม่หนาแน่นเกินไป, มีความต่อเนื่อง
      if (ratio < 1.3 || ratio > 3.5) return resolve(false);
      if (density < 0.02 || density > 0.25) return resolve(false);

      // ✅ ตรวจสอบความต่อเนื่อง (ไม่กระจายเป็นหลายก้อน)
      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
      const varianceY = ys.reduce((a, b) => a + Math.pow(b - avgY, 2), 0) / ys.length;
      const continuity = Math.sqrt(varianceY) / h;
      if (continuity > 0.45) return resolve(false);

      resolve(true);
    };
  });
}

  // 🐠 อัปโหลดปลา (จำกัดสูงสุด 20 ตัว)
  async function uploadFish(imageData) {
    const { getDatabase, ref, remove, get, orderByKey, query } = await import("https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js");
    const snapshot = await get(query(dbRef, orderByKey()));
    const fishes = snapshot.exists() ? Object.entries(snapshot.val()) : [];

    if (fishes.length >= 20) {
      const oldestKey = fishes[0][0];
      await remove(ref(db, `fishes/${oldestKey}`));
      console.log("🐟 Removed oldest fish to keep limit 20");
    }

    const fishData = { image: imageData, time: Date.now() };
    await window.firebasePush(dbRef, fishData);
  }

  // 🍽️ Feed ปลาขึ้น Firebase
  document.getElementById("feedBtn").addEventListener("click", async () => {
    const img = canvas.toDataURL("image/png");
    const isFish = await checkIfFish(img);
    if (!isFish) return alert("That’s not a fish 🐱💬");
    addFish(img);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await uploadFish(img);
  });

  // 🪸 โหลดปลา realtime
  const queryRef = window.firebaseQuery(dbRef, window.firebaseLimit(20));
  window.firebaseOnValue(queryRef, snapshot => {
    const data = snapshot.val();
    fishContainer.innerHTML = "";
    if (!data) return;
    Object.values(data).forEach(f => addFish(f.image));
  });

  // 🧭 ปุ่มไปหน้า Fish List
  document.getElementById("listBtn").addEventListener("click", () => {
    window.location.href = "fishlist.html";
  });
})();
