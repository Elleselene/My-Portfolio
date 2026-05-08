// ── INTRO LOADER ─────────────────────────────────────────
(function() {
  document.body.classList.add('loading');

  const loader    = document.getElementById('intro-loader');
  const fill      = document.getElementById('intro-progress-fill');
  const pctEl     = document.getElementById('intro-progress-pct');
  const taglineEl = document.getElementById('intro-tagline');

  const steps = [
    { pct: 15,  label: 'Initializing...' },
    { pct: 32,  label: 'Loading assets...' },
    { pct: 55,  label: 'Building UI...' },
    { pct: 74,  label: 'Rendering canvas...' },
    { pct: 91,  label: 'Almost there...' },
    { pct: 100, label: 'Welcome.' },
  ];

  let stepIndex = 0;

  function runStep() {
    if (stepIndex >= steps.length) return;
    const { pct, label } = steps[stepIndex];
    fill.style.width = pct + '%';
    pctEl.textContent = pct + '%';
    taglineEl.textContent = label;
    stepIndex++;

    if (pct < 100) {
      const delay = 280 + Math.random() * 260;
      setTimeout(runStep, delay);
    } else {
      setTimeout(dismissLoader, 650);
    }
  }

  function dismissLoader() {
    // burst particles
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'intro-particle';
      const angle = (i / 18) * Math.PI * 2;
      const dist  = 80 + Math.random() * 120;
      p.style.cssText = `left:${cx}px;top:${cy}px;opacity:1;transition:transform 0.7s ease,opacity 0.7s ease;`;
      loader.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
        p.style.opacity   = '0';
      });
    }

    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 700);
  }

  // start after logo animation (0.6s) + small buffer
  setTimeout(runStep, 900);
})();

// ── THEME TOGGLE ────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  // re-init canvas colors
  updateCanvasColors();
});

// ── CURSOR ──────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.left=mx-4+'px';cursor.style.top=my-4+'px';
});
function animCursor(){ rx+=(mx-rx-16)*0.12; ry+=(my-ry-16)*0.12; cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px'; requestAnimationFrame(animCursor); }
animCursor();
document.querySelectorAll('a,button,.skill-tag,.service-card,.project-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ cursor.style.transform='scale(2.5)'; cursorRing.style.width='50px'; cursorRing.style.height='50px'; cursorRing.style.borderColor='var(--accent-glow)'; });
  el.addEventListener('mouseleave',()=>{ cursor.style.transform='scale(1)'; cursorRing.style.width='32px'; cursorRing.style.height='32px'; cursorRing.style.borderColor='var(--accent-glow)'; });
});

// ── CANVAS ──────────────────────────────────────────────
const canvas=document.getElementById('bgCanvas');
const ctx=canvas.getContext('2d');
let W,H,particles=[],gridOffset=0,waveT=0;
let particleColor='255,110,180',gridColor='255,110,180';

function updateCanvasColors(){
  const isDark = html.getAttribute('data-theme')==='dark';
  particleColor = isDark ? '255,110,180' : '214,0,122';
  gridColor     = isDark ? '255,110,180' : '214,0,122';
}
updateCanvasColors();

function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
resize(); window.addEventListener('resize',()=>{ resize(); initParticles(); });

class Particle {
  constructor(){ this.reset(); }
  reset(){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-0.5)*0.3; this.vy=(Math.random()-0.5)*0.3; this.r=Math.random()*1.5+0.3; this.opacity=Math.random()*0.5+0.1; this.pulse=Math.random()*Math.PI*2; }
  update(){ this.x+=this.vx; this.y+=this.vy; this.pulse+=0.02; if(this.x<-10||this.x>W+10||this.y<-10||this.y>H+10) this.reset(); }
  draw(){ const op=this.opacity*(0.7+0.3*Math.sin(this.pulse)); ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`rgba(${particleColor},${op})`; ctx.fill(); }
}
function initParticles(){ const c=Math.min(Math.floor(W*H/14000),100); particles=Array.from({length:c},()=>new Particle()); }
initParticles();
function drawConnections(){ for(let i=0;i<particles.length;i++){ for(let j=i+1;j<particles.length;j++){ const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,dist=Math.sqrt(dx*dx+dy*dy); if(dist<120){ ctx.strokeStyle=`rgba(${gridColor},${(1-dist/120)*0.07})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); } } } }
function drawGrid(){ gridOffset=(gridOffset+0.15)%48; ctx.strokeStyle=`rgba(${gridColor},0.025)`; ctx.lineWidth=1; for(let x=-48+gridOffset%48;x<W+48;x+=48){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); } for(let y=0;y<H;y+=48){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); } }
function drawWaves(){ waveT+=0.008; for(let w=0;w<3;w++){ ctx.beginPath(); ctx.strokeStyle=`rgba(${particleColor},${0.04-w*0.01})`; ctx.lineWidth=1; const baseY=H*0.75+w*30; for(let x=0;x<=W;x+=4){ const y=baseY+Math.sin(x*0.008+waveT+w*0.8)*18+Math.sin(x*0.015+waveT*1.3+w)*10; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.stroke(); } }
function animate(){ ctx.clearRect(0,0,W,H); drawGrid(); drawWaves(); particles.forEach(p=>{p.update();p.draw();}); drawConnections(); requestAnimationFrame(animate); }
animate();

// ── NAV ─────────────────────────────────────────────────
document.getElementById('navToggle').addEventListener('click',()=>{ document.getElementById('navLinks').classList.toggle('open'); });
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navLinks').classList.remove('open')));

// ── SCROLL ──────────────────────────────────────────────
const sections=['home','about','skills','projects','services','contact'];
const sectionNames=['HOME','ABOUT','SKILLS','PROJECTS','SERVICES','CONTACT'];
function onScroll(){
  const scrolled=window.scrollY,total=document.body.scrollHeight-window.innerHeight;
  document.getElementById('scrollProgress').style.width=(total>0?(scrolled/total)*100:0)+'%';
  let cur=0; sections.forEach((id,i)=>{ const el=document.getElementById(id); if(el&&el.getBoundingClientRect().top<=80)cur=i; });
  document.getElementById('statusSection').textContent=sectionNames[cur];
  const nav=document.getElementById('mainNav');
  nav.style.background=scrolled>50?'var(--nav-bg-scroll)':'var(--nav-bg)';
}
window.addEventListener('scroll',onScroll,{passive:true});

// ── INTERSECTION OBSERVER ────────────────────────────────
const io=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);} }),{threshold:0.1});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));
document.querySelectorAll('#home .fade-up').forEach(el=>el.classList.add('visible'));

// ── FORM ─────────────────────────────────────────────────
document.querySelector('.form-submit').addEventListener('click',function(){
  const name=document.querySelector('.form-input').value;
  if(name.trim()){
    this.querySelector('span').textContent='✓ Message Sent!';
    this.style.background='var(--accent)';this.style.color='#fff';
    setTimeout(()=>{ this.querySelector('span').textContent='Send Message →'; this.style.background='';this.style.color=''; },3000);
  }
});
