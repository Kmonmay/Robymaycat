const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.getAttribute('data-color');
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

canvas.addEventListener('mousedown', e => start(e.offsetX, e.offsetY));
canvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', () => drawing=false);
canvas.addEventListener('mouseleave', () => drawing=false);

function start(x,y){ drawing=true; ctx.beginPath(); ctx.moveTo(x,y);}
function draw(x,y){
  if(!drawing) return;
  ctx.lineTo(x,y);
  ctx.strokeStyle=currentColor;
  ctx.lineWidth=8;
  ctx.lineCap='round';
  ctx.stroke();
}

document.getElementById('clearBtn').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));

const fishContainer=document.getElementById('fishContainer');
function addFishToAquarium(imageData){
  const fish=document.createElement('img');
  fish.src=imageData;
  fish.classList.add('fish');
  fish.style.width='120px';
  fish.style.top=60+Math.random()*25+'%';
  fish.style.left=Math.random()*60+'%';
  fish.style.animationDuration=(8+Math.random()*4)+'s';
  fishContainer.appendChild(fish);
}

function showReaction(text){
  const t=document.getElementById('reactionText');
  t.textContent=text;
  t.style.opacity=1;
  setTimeout(()=>t.style.opacity=0,2500);
}
function spawnBubbles(){
  const c=document.getElementById('bubbles');
  for(let i=0;i<6;i++){
    const b=document.createElement('div');
    b.classList.add('bubble');
    const s=8+Math.random()*10;
    b.style.width=b.style.height=s+'px';
    b.style.left=Math.random()*100+'%';
    b.style.backgroundColor=`rgba(173,216,230,${0.5+Math.random()*0.3})`;
    b.style.animationDelay=Math.random()+'s';
    c.appendChild(b);
    setTimeout(()=>b.remove(),3000);
  }
}

document.getElementById('feedBtn').addEventListener('click',()=>{
  const img=canvas.toDataURL('image/png');
  showReaction("Yummy! Thank you for the fish!");
  spawnBubbles();
  addFishToAquarium(img);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(window.saveFish) window.saveFish(img);
});

if(window.db){
  const dbRef=window.firebaseRef(window.db,'fishes');
  async function uploadFish(imageData){
    await window.firebasePush(dbRef,{image:imageData,time:Date.now()});
  }
  window.firebaseOnValue(window.firebaseLimit(dbRef,15),(snapshot)=>{
    const data=snapshot.val();
    if(!data) return;
    fishContainer.innerHTML='';
    Object.values(data).forEach(fish=>{
      const fishImg=document.createElement('img');
      fishImg.src=fish.image;
      fishImg.classList.add('fish');
      fishImg.style.width='120px';
      fishImg.style.top=60+Math.random()*25+'%';
      fishImg.style.left=Math.random()*60+'%';
      fishImg.style.animationDuration=(8+Math.random()*4)+'s';
      fishContainer.appendChild(fishImg);
    });
  });
  window.saveFish=uploadFish;
}

const bg=document.getElementById('bgMusic');
if(bg) bg.volume=0.3;
