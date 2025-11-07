body {
  margin: 0;
  font-family: "Cooper Black", sans-serif;
  background: linear-gradient(to bottom, #e8f7ff, #ffffff);
  text-align: center;
  color: #333;
  overflow-x: hidden;
}

h1 {
  color: #4da6ff;
  font-size: 2.5rem;
  margin-top: 30px;
}

.subtitle {
  font-size: 1.1rem;
  color: #555;
}

/* 🐠 ตู้ปลา */
.aquarium {
  position: relative;
  display: inline-block;
}
.aquarium video {
  width: min(720px, 90vw);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
#fishContainer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.fish {
  position: absolute;
  width: 120px;
  opacity: 0.9;
  pointer-events: auto; /* ✅ ให้แตะได้ */
  transition: top 8s ease-in-out, left 8s ease-in-out, transform 1s ease;
}

/* 🎨 ตัวเลือกสี */
.color-picker { margin: 20px 0; font-size: 1.1rem; }
.color-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  margin: 0 8px;
  cursor: pointer;
  transition: transform .2s, border .2s;
}
.color-btn:hover { transform: scale(1.15); }
.color-btn.active { border: 3px solid #333; transform: scale(1.2); }

.pink { background:#ff91a4; }
.yellow { background:#ffd966; }
.green { background:#7ed957; }
.brown { background:#a67b5b; }
.red { background:#ff4d4d; }
.black { background:#000; }

/* 🎨 พื้นที่วาด */
canvas, #drawCanvas {
  display: block;
  margin: 0 auto;
  width: 90%;
  max-width: 400px;
  height: 300px;
  border: 3px dashed #99ccff;
  border-radius: 20px;
  background-color: #f0faff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: crosshair;
  touch-action: none;
}

/* 🖌️ Canvas Drawing Area */
#drawCanvas {
  background-color: #eaf6ff;
  border: 2px dashed #add8e6;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(173, 216, 230, 0.4);
  cursor: crosshair;

  /* 🧩 เพิ่ม 3 บรรทัดนี้ */
  position: relative;
  z-index: 10;          /* ✅ ให้ canvas อยู่เหนือ video */
  pointer-events: auto; /* ✅ รับการวาดจากเมาส์/นิ้วได้จริง */
}

/* 🧁 ปุ่ม */
button {
  background: #cce6ff;
  border: none;
  border-radius: 15px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0 8px;
  transition: 0.3s;
}
button:hover {
  background: #99d6ff;
  transform: scale(1.05);
}

/* 💬 พื้นที่ข้อความ reaction */
.reaction-area {
  position: relative;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 180px;
}
#reactionText {
  font-size: 1.3rem;
  font-weight: bold;
  color: #444;
  opacity: 0;
  transition: opacity 0.5s;
}

/* 🫧 ฟองอากาศ */
.bubble {
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  opacity: 0.7;
  animation: float 3s ease-in infinite;
  background: rgba(173, 216, 230, 0.6);
}
@keyframes float {
  from { transform: translateY(0) scale(1); opacity: .7; }
  to { transform: translateY(-120px) scale(1.3); opacity: 0; }
}

.pop-bubble {
  position: absolute;
  border-radius: 50%;
  animation: pop 0.5s ease-out forwards;
}
@keyframes pop {
  0% { transform: scale(0.7); opacity: 0.8; }
  70% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

/* 🩵 Footer */
footer {
  margin: 30px 0;
  font-size: .9rem;
  color: #888;
}
/* ✅ ให้แน่ใจว่าปลาและวิดีโอไม่บัง canvas */
.aquarium {
  position: relative;
  z-index: 1;
}

#fishContainer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none; /* ป้องกันไม่ให้บังการแตะ/ลากบน canvas */
}

/* ✅ Canvas อยู่เหนือสุด รับการแตะ/คลิกได้จริง */
#drawCanvas {
  position: relative;
  z-index: 10;          /* อยู่เหนือทั้ง video และปลา */
  pointer-events: auto; /* รับ event ได้แน่นอน */
  touch-action: none;   /* ป้องกันมือถือเลื่อนหรือซูม */
}
