if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);
addEventListener('load', () => scrollTo(0, 0), { once: true });

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const siteLoader=document.querySelector('.site-loader');
const siteLoaderCount=siteLoader?.querySelector('.site-loader-status b');
if(siteLoader){
  document.body.classList.add('is-loading');
  const loaderStarted=performance.now();
  const loaderDuration=reduced?250:2820;
  const updateLoaderCount=now=>{
    const progress=Math.min(1,(now-loaderStarted)/loaderDuration);
    const eased=1-Math.pow(1-progress,3);
    if(siteLoaderCount) siteLoaderCount.textContent=String(Math.round(eased*100)).padStart(3,'0');
    if(progress<1) requestAnimationFrame(updateLoaderCount);
  };
  requestAnimationFrame(updateLoaderCount);
  setTimeout(()=>{
    document.body.classList.remove('is-loading');
    siteLoader.remove();
  },reduced?400:4300);
}
const glow = document.querySelector('.cursor-glow');
const dot = document.querySelector('.cursor-dot');
let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;

if (!reduced && matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove',e=>{ mx=e.clientX; my=e.clientY; dot.style.transform=`translate3d(${mx}px,${my}px,0)`; },{passive:true});
}

// Reusable variable-weight spotlight for any heading text.
const heroWeightHeading=document.querySelector('.hero-nav h1');
const heroWeightChars=[];
if(heroWeightHeading){
  const source=heroWeightHeading.innerHTML;
  heroWeightHeading.innerHTML='';
  const parts=source.split(/(<br\s*\/?>)/gi);
  for(let p=0;p<parts.length;p++){
    if(/^<br/i.test(parts[p])){ heroWeightHeading.insertAdjacentHTML('beforeend','<br />'); continue; }
    const text=parts[p].replace(/<[^>]+>/g,'');
    for(let i=0;i<text.length;i++){
      const span=document.createElement('span');
      span.className='hero-weight-char';
      span.textContent=text[i]===' ' ? '\u00a0' : text[i];
      span.setAttribute('aria-hidden','true');
      heroWeightHeading.appendChild(span);
      heroWeightChars.push(span);
    }
  }
  heroWeightHeading.setAttribute('aria-label','We build intelligent software and digital experiences that move businesses forward');
}
if(heroWeightHeading && heroWeightChars.length){
  const minimumWeight=400;
  const maximumWeight=800;
  const pointerSmoothing=.25;
  let targetX=-innerWidth;
  let smoothedX=targetX;
  let weightFrame=0;
  let visible=true;
  const reducedWeight=500;
  const setResting=()=>{
    for(let i=0;i<heroWeightChars.length;i++){
      heroWeightChars[i].style.fontWeight=String(reduced?reducedWeight:minimumWeight);
      heroWeightChars[i].style.fontVariationSettings=`"wght" ${reduced?reducedWeight:minimumWeight}`;
    }
  };
  const schedule=()=>{ if(!weightFrame) weightFrame=requestAnimationFrame(drawWeights); };
  const drawWeights=()=>{
    weightFrame=0;
    if(reduced||!visible||document.hidden){ setResting(); return; }
    smoothedX+=(targetX-smoothedX)*pointerSmoothing;
    const influenceRadius=innerWidth*.5;
    for(let i=0;i<heroWeightChars.length;i++){
      const rect=heroWeightChars[i].getBoundingClientRect();
      const horizontalDistance=Math.abs(smoothedX-(rect.left+rect.width*.5));
      const proximity=Math.max(0,Math.min(1,1-horizontalDistance/influenceRadius));
      const easedProximity=proximity*proximity*(3-2*proximity);
      const weight=minimumWeight+(maximumWeight-minimumWeight)*easedProximity;
      heroWeightChars[i].style.fontWeight=String(Math.round(weight));
      heroWeightChars[i].style.fontVariationSettings=`"wght" ${Math.round(weight)}`;
    }
    weightFrame=requestAnimationFrame(drawWeights);
  };
  const move=(event)=>{ if(event.pointerType&&event.pointerType!=='mouse'){ leave(); return; } targetX=event.clientX; schedule(); };
  const leave=()=>{ targetX=-innerWidth; schedule(); };
  const observerWeight=new IntersectionObserver(entries=>{ visible=entries[0].isIntersecting; if(visible) schedule(); },{threshold:0});
  observerWeight.observe(heroWeightHeading);
  addEventListener('pointermove',move,{passive:true});
  addEventListener('pointerup',event=>{ if(event.pointerType&&event.pointerType!=='mouse') leave(); },{passive:true});
  addEventListener('pointerout',event=>{ if(!event.relatedTarget) leave(); },{passive:true});
  addEventListener('blur',leave,{passive:true});
  addEventListener('visibilitychange',()=>{ if(document.hidden) leave(); else schedule(); },{passive:true});
  addEventListener('resize',schedule,{passive:true});
  setResting();
  schedule();
}


const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')), { threshold:.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const featuredHead=document.querySelector('.featured-head');
const featuredSection=document.querySelector('.featured-work');
const featuredTitle=featuredHead?.querySelector('h2');
const featuredCopy=featuredHead?.querySelector('p');
const workCards=[...document.querySelectorAll('.work-card')];
if(featuredTitle){
  const titleText=featuredTitle.textContent;
  featuredTitle.textContent='';
  for(let i=0;i<titleText.length;i++){
    if(titleText[i]===' '){ featuredTitle.appendChild(document.createTextNode(' ')); continue; }
    const mask=document.createElement('span');
    mask.className='featured-title-char-mask';
    const char=document.createElement('span');
    char.className='featured-title-char';
    char.style.setProperty('--char-index',i);
    char.textContent=titleText[i];
    mask.appendChild(char);
    featuredTitle.appendChild(mask);
  }
}
if(featuredCopy){
  const words=featuredCopy.textContent.trim().split(/\s+/);
  featuredCopy.textContent='';
  for(let i=0;i<words.length;i++){
    const mask=document.createElement('span');
    mask.className='featured-copy-word';
    const word=document.createElement('span');
    word.style.setProperty('--word-index',i);
    word.textContent=words[i];
    mask.appendChild(word);
    featuredCopy.appendChild(mask);
    featuredCopy.appendChild(document.createTextNode(' '));
  }
}
for(let c=0;c<workCards.length;c++){
  const heading=workCards[c].querySelector('h3');
  const text=heading.textContent;
  heading.textContent='';
  for(let i=0;i<text.length;i++){
    const wrap=document.createElement('span');
    wrap.className='project-char';
    if(text[i]===' ') wrap.style.width='.28em';
    else{
      const inner=document.createElement('span');
      inner.className='project-char-inner';
      inner.style.setProperty('--char-index',i);
      const first=document.createElement('span'); first.textContent=text[i];
      const second=document.createElement('span'); second.textContent=text[i];
      inner.append(first,second); wrap.appendChild(inner);
    }
    heading.appendChild(wrap);
  }
}
if(reduced){
  featuredHead?.classList.add('is-inview');
  for(let i=0;i<workCards.length;i++) workCards[i].classList.add('is-inview');
}else{
  const featuredObserver=new IntersectionObserver(entries=>{
    for(let i=0;i<entries.length;i++) if(entries[i].isIntersecting){ entries[i].target.classList.add('is-inview'); featuredObserver.unobserve(entries[i].target); }
  },{rootMargin:'0px 0px -12% 0px',threshold:.08});
  if(featuredHead) featuredObserver.observe(featuredHead);
  for(let i=0;i<workCards.length;i++) featuredObserver.observe(workCards[i]);
}

const introSection=document.querySelector('.intro');
const introCopy=document.querySelector('.intro-scroll-copy');
const introPath=document.querySelector('.intro-flow-line-progress');
const introFlowPaths=[...document.querySelectorAll('.intro-flow-line path')];
let introWords=[];
let introPathLength=0;
let introTicking=false;

if(introSection&&introCopy){
  const nodes=[...introCopy.childNodes];
  introCopy.textContent='';
  for(let n=0;n<nodes.length;n++){
    const node=nodes[n];
    const isEm=node.nodeType===1&&node.tagName==='EM';
    const value=node.textContent.trim();
    if(!value) continue;
    const parts=value.split(/\s+/);
    for(let i=0;i<parts.length;i++){
      const mask=document.createElement(isEm?'em':'span');
      mask.className='intro-word-mask';
      const word=document.createElement('span');
      word.className='intro-word';
      word.textContent=parts[i];
      mask.appendChild(word);
      introCopy.appendChild(mask);
      introCopy.appendChild(document.createTextNode(' '));
      introWords.push(word);
    }
  }
  if(introPath){
    introPathLength=introPath.getTotalLength();
    for(let i=0;i<introFlowPaths.length;i++){
      introFlowPaths[i].style.strokeDasharray=`${introPathLength}`;
      introFlowPaths[i].style.strokeDashoffset=`${introPathLength}`;
    }
  }
  const sizeFlowLine=()=>{
    if(!introPath) return;
    const main=document.querySelector('.landing');
    const top=introSection.offsetTop;
    const bottom=introSection.offsetTop+introSection.offsetHeight;
    main.style.setProperty('--flow-top',`${top}px`);
    main.style.setProperty('--flow-height',`${bottom-top}px`);
  };
  sizeFlowLine();

  const renderIntro=()=>{
    introTicking=false;
    const rect=introSection.getBoundingClientRect();
    const textStart=innerHeight*.98;
    const textDistance=innerHeight*.55+rect.height*.18;
    const textProgress=Math.max(0,Math.min(1,(textStart-rect.top)/textDistance));
    const flowDistance=innerHeight*.58+rect.height*.48;
    const lineProgress=Math.max(0,Math.min(1,(innerHeight*.9-rect.top)/flowDistance));
    const count=introWords.length;
    for(let i=0;i<count;i++){
      const wordProgress=Math.max(0,Math.min(1,(textProgress*(count+1)-i)/2));
      const eased=1-Math.pow(1-wordProgress,3);
      introWords[i].style.transform=`translate3d(0,${(1-eased)*112}%,0)`;
      introWords[i].style.opacity=`${eased}`;
    }
    if(introPath){
      const offset=`${introPathLength*(1-lineProgress)}`;
      for(let i=0;i<introFlowPaths.length;i++) introFlowPaths[i].style.strokeDashoffset=offset;
    }
  };
  const requestIntro=()=>{ if(!introTicking){ introTicking=true; requestAnimationFrame(renderIntro); } };
  addEventListener('scroll',requestIntro,{passive:true});
  addEventListener('resize',()=>{ sizeFlowLine(); requestIntro(); },{passive:true});
  if(reduced){
    for(let i=0;i<introWords.length;i++){ introWords[i].style.transform='none'; introWords[i].style.opacity='1'; }
    if(introPath) for(let i=0;i<introFlowPaths.length;i++) introFlowPaths[i].style.strokeDashoffset='0';
  }else requestIntro();
}

document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); el.style.transform=`translate3d(${(e.clientX-r.left-r.width/2)*.09}px,${(e.clientY-r.top-r.height/2)*.12}px,0)`; });
  el.addEventListener('pointerleave',()=>el.style.transform='translate3d(0,0,0)');
});

const serviceStack=document.querySelector('.service-stack');
const serviceCards=serviceStack?[...serviceStack.querySelectorAll('.service-card')]:[];
const serviceRotations=[-7,5,-3,6,-5,4,-3];
function setServiceStack(active=-1){
  if(!serviceStack||matchMedia('(max-width:700px)').matches) return;
  const overlap=parseFloat(getComputedStyle(serviceStack).getPropertyValue('--overlap'))||150;
  const push=Math.min(innerWidth*.15,225);
  for(let i=0;i<serviceCards.length;i++){
    let x=i*overlap,y=0,rotation=serviceRotations[i]||0,scale=1,z=i+1;
    if(active>=0){
      if(i<active){ x-=push; y=-8; }
      if(i>active){ x+=push; y=8; }
      if(i===active){ y=-30; rotation=0; scale=1.035; z=20; }
    }
    serviceCards[i].style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;
    serviceCards[i].style.zIndex=`${z}`;
    serviceCards[i].classList.toggle('is-active',i===active);
  }
}
for(let i=0;i<serviceCards.length;i++){
  serviceCards[i].addEventListener('pointerenter',()=>setServiceStack(i));
  serviceCards[i].addEventListener('pointerleave',()=>setServiceStack(-1));
  serviceCards[i].addEventListener('focus',()=>setServiceStack(i));
  serviceCards[i].addEventListener('blur',()=>setServiceStack(-1));
}
addEventListener('resize',()=>setServiceStack(-1),{passive:true});
setServiceStack(-1);

const scenes=[
  ['A new era of software is here.','Built around people. Powered by possibility.',5000],
  ['Ideas become intelligent.','We shape complexity into products that feel effortless.',5000],
  ['Systems learn. Experiences evolve.','Strategy, design and engineering—in one fluid motion.'],
  ['Meet ELZION.','Your future, engineered with intent.',3000]
];
const line=document.querySelector('#film-line');
const sub=document.querySelector('#film-sub');
const copy=document.querySelector('.film-copy');
let scene=0, elapsed=0, last=performance.now();
const sceneDurations=[5000,5000,5000,3000];
const totalSceneDuration=sceneDurations.reduce((a,b)=>a+b,0);
function timeline(now){
  elapsed += now-last;
  const loopTime=elapsed%totalSceneDuration;
  let next=0, cursor=0;
  for(let i=0;i<sceneDurations.length;i++){ cursor+=sceneDurations[i]; if(loopTime<cursor){ next=i; break; } }
  if(next!==scene){
    scene=next;
    copy.classList.add('changing');
    setTimeout(()=>{
      line.textContent=scenes[scene][0];
      sub.textContent=scenes[scene][1];
      copy.classList.remove('changing');
    },480);
  }
  last=now;
  requestAnimationFrame(timeline);
}
requestAnimationFrame(timeline);

const manifestoLines=[...document.querySelectorAll('.manifesto-line')].filter(line=>!line.closest('.service-manifesto-words'));
manifestoLines.forEach(line=>{
  const word=line.firstElementChild;
  const text=word.textContent;
  word.textContent='';
  for(let i=0;i<text.length;i++){
    const char=document.createElement('span');
    char.className='manifesto-char';
    char.textContent=text[i]===' ' ? '\u00a0' : text[i];
    char.style.setProperty('--char-index',i);
    word.appendChild(char);
  }
});
if(reduced){
  manifestoLines.forEach(line=>{ line.classList.add('is-revealed'); line.classList.add('done'); });
}else{
  const wordObserver=new IntersectionObserver(entries=>{
    for(let i=0;i<entries.length;i++){
      const entry=entries[i];
      if(entry.isIntersecting){
        entry.target.classList.add('is-revealed');
        wordObserver.unobserve(entry.target);
      }
    }
  },{rootMargin:'0px 0px -20% 0px',threshold:0});
  manifestoLines.forEach(line=>wordObserver.observe(line));
}

const serviceWords=document.querySelector('.service-manifesto-words');
const serviceSection=document.querySelector('#manifesto');
const serviceSticky=document.querySelector('.manifesto-services');
const serviceLines=serviceWords?.querySelector('.service-lines');
const serviceRows=serviceLines?[...serviceLines.querySelectorAll('.manifesto-line')]:[];
let serviceScrollFrame=0;
let activeServiceRow=-1;

function centerServiceRow(index,immediate=false){
  if(!serviceLines||!serviceSticky||!serviceWords||!serviceRows[index]||index===activeServiceRow) return;
  activeServiceRow=index;
  if(immediate) serviceLines.style.transition='none';
  const row=serviceRows[index];
  const rowCenter=row.offsetTop+row.offsetHeight*.5;
  const viewportCenter=serviceSticky.clientHeight*.5-serviceWords.offsetTop;
  serviceWords.style.setProperty('--service-label-y',`${viewportCenter}px`);
  serviceLines.style.setProperty('--service-y',`${viewportCenter-rowCenter}px`);
  if(immediate) requestAnimationFrame(()=>{serviceLines.style.transition='';});
}

function drawServiceScroll(){
  serviceScrollFrame=0;
  if(!serviceSection||reduced||!serviceRows.length) return;
  const rect=serviceSection.getBoundingClientRect();
  const travel=Math.max(1,serviceSection.offsetHeight-innerHeight);
  const progress=Math.max(0,Math.min(1,-rect.top/travel));
  centerServiceRow(Math.round(progress*(serviceRows.length-1)));
}

function requestServiceScroll(){
  if(serviceScrollFrame) return;
  serviceScrollFrame=requestAnimationFrame(drawServiceScroll);
}

if(serviceSection&&serviceRows.length&&!reduced){
  addEventListener('scroll',requestServiceScroll,{passive:true});
  addEventListener('resize',()=>{activeServiceRow=-1;requestServiceScroll();},{passive:true});
  document.fonts.ready.then(()=>{activeServiceRow=-1;centerServiceRow(0,true);drawServiceScroll();});
}

const expertiseDeck=document.querySelector('.expertise-deck');
const expertiseCards=expertiseDeck?[...expertiseDeck.querySelectorAll('.expertise-card-3d')]:[];
const expertiseProgress=expertiseDeck?.querySelector('.deck-progress');
let expertiseFrame=0;
function drawExpertiseDeck(){
  expertiseFrame=0;
  if(!expertiseDeck||expertiseCards.length!==4) return;
  const rect=expertiseDeck.getBoundingClientRect();
  const travel=Math.max(1,expertiseDeck.offsetHeight-innerHeight);
  const p=Math.max(0,Math.min(1,-rect.top/travel));
  const intro=Math.max(0,Math.min(1,p*3));
  const fan=Math.max(0,Math.min(1,(p-.08)/.30));
  const width=innerWidth;
  const spread=Math.min(width*.19,225);
  const rotations=[-20,-7,7,20];
  const yOffsets=[14,5,5,14];
  for(let i=0;i<expertiseCards.length;i++){
    const center=(i-1.5)*spread;
    const x=-18+center*fan;
    const y=yOffsets[i]*(1-fan);
    const z=-Math.abs(i-1.5)*20*(1-fan);
    const rot=-5+(rotations[i]+5)*fan;
    const cardFlip=Math.max(0,Math.min(1,(p-(.43+i*.018))/.20));
    expertiseCards[i].style.transform=`translate3d(${x}px,${y}px,${z}px) rotateZ(${rot}deg) rotateY(${cardFlip*180}deg)`;
    expertiseCards[i].style.zIndex=String(10+i);
    const front=expertiseCards[i].querySelector('.expertise-card-front');
    const back=expertiseCards[i].querySelector('.expertise-card-back');
    if(front&&back){
      front.style.opacity=cardFlip>.5?'0':'1';
      back.style.opacity=cardFlip>.5?'1':'0';
    }
  }
  if(expertiseProgress) expertiseProgress.textContent=`${Math.min(4,Math.max(1,Math.floor(p*4)+1)).toString().padStart(2,'0')} / 04`;
  const introEl=expertiseDeck.querySelector('.expertise-deck-intro');
  if(introEl){ introEl.style.opacity=String(1-intro); introEl.style.transform=`translate3d(0,${intro*-70}px,0)`; }
}
function requestExpertiseDeck(){ if(expertiseFrame) return; expertiseFrame=requestAnimationFrame(drawExpertiseDeck); }
if(expertiseDeck){
  addEventListener('scroll',requestExpertiseDeck,{passive:true});
  addEventListener('resize',requestExpertiseDeck,{passive:true});
  drawExpertiseDeck();
}

const mobileExpertiseDeck=document.querySelector('.mobile-expertise-deck');
const mobileExpertiseStage=document.querySelector('.mobile-expertise-stage');
const mobileExpertiseCards=[...document.querySelectorAll('.mobile-expertise-card')];
const mobileExpertiseCurrent=document.querySelector('.mobile-expertise-counter span');
let mobileExpertiseFrame=0;
function drawMobileExpertise(){
  mobileExpertiseFrame=0;
  if(!mobileExpertiseDeck||!mobileExpertiseStage||!mobileExpertiseCards.length) return;
  const rect=mobileExpertiseDeck.getBoundingClientRect();
  const travel=Math.max(1,mobileExpertiseDeck.offsetHeight-innerHeight);
  const p=Math.max(0,Math.min(1,-rect.top/travel));
  const position=p*mobileExpertiseCards.length;
  const active=Math.min(mobileExpertiseCards.length-1,Math.floor(position));
  mobileExpertiseStage.style.setProperty('--mobile-expertise-p',p.toFixed(4));
  if(mobileExpertiseCurrent) mobileExpertiseCurrent.textContent=String(active+1).padStart(2,'0');
  for(let index=0;index<mobileExpertiseCards.length;index++){
    const card=mobileExpertiseCards[index];
    const local=Math.max(0,Math.min(1,(position-index)*1.35));
    const passed=position>index+.92;
    const depth=Math.max(0,index-active);
    const side=passed?-1:(index%2===0?-1:1);
    const exit=passed?Math.max(0,Math.min(1,(position-index-.92)*2.8)):0;
    card.style.setProperty('--mobile-local',local.toFixed(4));
    card.style.setProperty('--mobile-depth',String(depth));
    card.style.setProperty('--mobile-x',`${side*(depth*12+exit*88)}px`);
    card.style.setProperty('--mobile-y',`${depth*12-exit*38}px`);
    card.style.setProperty('--mobile-r',`${side*(depth*2.5+exit*10)}deg`);
    card.style.setProperty('--mobile-opacity',String(Math.max(0,Math.min(1,1-exit*.95-depth*.08))));
    card.style.zIndex=String(20-index+(passed?-20:0));
  }
}
function requestMobileExpertise(){
  if(!mobileExpertiseFrame) mobileExpertiseFrame=requestAnimationFrame(drawMobileExpertise);
}
if(mobileExpertiseDeck){
  addEventListener('scroll',requestMobileExpertise,{passive:true});
  addEventListener('resize',requestMobileExpertise,{passive:true});
  drawMobileExpertise();
}

const chronoJourney=document.querySelector('.chrono-journey');
const chronoPercent=chronoJourney?.querySelector('.chrono-percent');
const chronoCards=chronoJourney?.querySelector('.chrono-cards');
let chronoFrame=0;
function drawChronoJourney(){
  chronoFrame=0;
  if(!chronoJourney) return;
  const rect=chronoJourney.getBoundingClientRect();
  const travel=Math.max(1,chronoJourney.offsetHeight-innerHeight);
  const p=Math.max(0,Math.min(1,-rect.top/travel));
  const warp=Math.max(0,Math.min(1,(p-.36)/.64));
  const flip=Math.max(0,Math.min(1,(p-.38)/.34));
  const cta=Math.max(0,Math.min(1,1-Math.abs(p-.11)/.11));
  const cardsIn=Math.max(0,Math.min(1,(p-.24)*4));
  const cardsOut=1-Math.max(0,Math.min(1,(p-.66)/.14));
  chronoJourney.style.setProperty('--chrono-p',p.toFixed(4));
  chronoJourney.style.setProperty('--chrono-warp',warp.toFixed(4));
  chronoJourney.style.setProperty('--chrono-flip',flip.toFixed(4));
  chronoJourney.style.setProperty('--chrono-cta',cta.toFixed(4));
  if(chronoCards) chronoCards.style.opacity=(cardsIn*cardsOut).toFixed(4);
  if(chronoPercent) chronoPercent.textContent=`${String(Math.round(p*100)).padStart(3,'0')}%`;
}
function requestChronoJourney(){
  if(chronoFrame) return;
  chronoFrame=requestAnimationFrame(drawChronoJourney);
}
if(chronoJourney){
  addEventListener('scroll',requestChronoJourney,{passive:true});
  addEventListener('resize',requestChronoJourney,{passive:true});
  drawChronoJourney();
}

const jothiScreens=[
  './assets/projects/jothi/screen-1.jpg',
  './assets/projects/jothi/screen-2.jpg',
  './assets/projects/jothi/screen-3.jpg',
  './assets/projects/jothi/screen-4.jpg',
  './assets/projects/jothi/screen-6.jpg',
  './assets/projects/jothi/screen-7.jpg',
  './assets/projects/jothi/screen-8.jpg'
];
const phoneScreens=[...document.querySelectorAll('.chrono-phone-screen')];
let phoneScreenTimer=0;
let phoneScreenStep=0;

for(let i=0;i<jothiScreens.length;i++){
  const preload=new Image();
  preload.src=jothiScreens[i];
}

function changePhoneScreen(image,index){
  image.classList.add('is-switching');
  window.setTimeout(()=>{
    image.src=jothiScreens[index];
    image.alt=`Jothi Vel Chits app screen ${index+1}`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>image.classList.remove('is-switching')));
  },240);
}

function advancePhoneScreens(){
  phoneScreenStep=(phoneScreenStep+1)%jothiScreens.length;
  for(let i=0;i<phoneScreens.length;i++){
    changePhoneScreen(phoneScreens[i],(phoneScreenStep+i*2)%jothiScreens.length);
  }
}

if(chronoJourney&&phoneScreens.length&&!reduced){
  const phoneScreenObserver=new IntersectionObserver(entries=>{
    const visible=entries[0].isIntersecting;
    if(visible&&!phoneScreenTimer) phoneScreenTimer=window.setInterval(advancePhoneScreens,2600);
    if(!visible&&phoneScreenTimer){ window.clearInterval(phoneScreenTimer); phoneScreenTimer=0; }
  },{threshold:.15});
  phoneScreenObserver.observe(chronoJourney);
}

const mobileProjectReel=document.querySelector('.mobile-project-reel');
const mobileProjectStage=document.querySelector('.mobile-project-stage');
let mobileProjectFrame=0;
function drawMobileProject(){
  mobileProjectFrame=0;
  if(!mobileProjectReel||!mobileProjectStage) return;
  const rect=mobileProjectReel.getBoundingClientRect();
  const travel=Math.max(1,mobileProjectReel.offsetHeight-innerHeight);
  const p=Math.max(0,Math.min(1,-rect.top/travel));
  mobileProjectStage.style.setProperty('--mobile-project-p',p.toFixed(4));
}
function requestMobileProject(){
  if(!mobileProjectFrame) mobileProjectFrame=requestAnimationFrame(drawMobileProject);
}
if(mobileProjectReel){
  addEventListener('scroll',requestMobileProject,{passive:true});
  addEventListener('resize',requestMobileProject,{passive:true});
  drawMobileProject();
}

const clientFeedback=document.querySelector('.client-feedback');
if(clientFeedback){
  if(reduced) clientFeedback.classList.add('is-inview');
  else new IntersectionObserver(entries=>{
    for(let i=0;i<entries.length;i++) if(entries[i].isIntersecting){
      entries[i].target.classList.add('is-inview');
    }
  },{threshold:.16}).observe(clientFeedback);
}

const retailTransition=document.querySelector('.retail-transition');
const retailTransitionSticky=retailTransition?.querySelector('.retail-transition-sticky');
let retailTransitionFrame=0;
function drawRetailTransition(){
  retailTransitionFrame=0;
  if(!retailTransition||!retailTransitionSticky||reduced) return;
  const rect=retailTransition.getBoundingClientRect();
  const travel=Math.max(1,retailTransition.offsetHeight-innerHeight);
  const p=Math.max(0,Math.min(1,-rect.top/travel));
  const open=Math.max(0,Math.min(1,(p-.08)/.72));
  retailTransitionSticky.style.setProperty('--retail-top',`${-open*102}%`);
  retailTransitionSticky.style.setProperty('--retail-bottom',`${open*102}%`);
  retailTransitionSticky.style.setProperty('--retail-core-scale',(0.7+open*.3).toFixed(3));
  retailTransitionSticky.style.setProperty('--retail-core-opacity',Math.min(1,open*2).toFixed(3));
}
function requestRetailTransition(){
  if(!retailTransitionFrame) retailTransitionFrame=requestAnimationFrame(drawRetailTransition);
}
if(retailTransition&&!reduced){
  addEventListener('scroll',requestRetailTransition,{passive:true});
  addEventListener('resize',requestRetailTransition,{passive:true});
  drawRetailTransition();
}

const retailRotatingScreens=[...document.querySelectorAll('[data-retail-rotator] .retail-phone>span>img')];
let retailScreenIndex=0;
let retailScreenTimer=0;
function advanceRetailScreens(){
  retailScreenIndex=(retailScreenIndex+1)%20;
  for(let i=0;i<retailRotatingScreens.length;i++){
    const image=retailRotatingScreens[i];
    image.classList.add('switching');
    const next=((retailScreenIndex+i*7)%20)+1;
    setTimeout(()=>{
      image.src=`./assets/projects/namba/screen-${String(next).padStart(2,'0')}.jpg`;
      image.classList.remove('switching');
    },180+i*70);
  }
}
if(retailRotatingScreens.length&&!reduced){
  const retailCase=document.querySelector('.retail-case');
  const retailObserver=new IntersectionObserver(entries=>{
    const visible=entries[0]?.isIntersecting;
    if(visible&&!retailScreenTimer) retailScreenTimer=window.setInterval(advanceRetailScreens,1900);
    if(!visible&&retailScreenTimer){window.clearInterval(retailScreenTimer);retailScreenTimer=0;}
  },{threshold:.08});
  retailObserver.observe(retailCase);
}

const finalParticleBox=document.querySelector('.final-cta');
const finalParticleCanvas=finalParticleBox?.querySelector('.final-particle-canvas');
if(finalParticleBox&&finalParticleCanvas&&!reduced){
  const particleContext=finalParticleCanvas.getContext('2d');
  const particleColors=['#f8f5ec','#f8f5ec','#b7ef42','#08b96f','#ff7657'];
  const particleCap=20000;
  const finalParticles=[];
  const pointer={x:0,y:0,inside:false,pressed:false,moved:false};
  let particleWidth=0;
  let particleHeight=0;
  let particleRatio=1;
  let particleFrame=0;
  let particleVisible=false;
  let particleLast=0;
  let particleRecycleIndex=0;
  let particleRainIndex=0;

  function seedFinalParticles(){
    if(finalParticles.length) return;
    for(let i=0;i<particleCap;i++){
      finalParticles.push({
        x:0,y:-20,
        vx:0,vy:0,
        size:2.2,
        rotation:0,spin:0,
        life:1,
        active:false,settled:false,
        shape:0,
        color:particleColors[0]
      });
    }
  }

  function resizeFinalParticles(){
    const rect=finalParticleBox.getBoundingClientRect();
    const oldWidth=particleWidth;
    const oldHeight=particleHeight;
    particleWidth=Math.max(1,rect.width);
    particleHeight=Math.max(1,rect.height);
    particleRatio=Math.min(devicePixelRatio||1,2);
    finalParticleCanvas.width=Math.round(particleWidth*particleRatio);
    finalParticleCanvas.height=Math.round(particleHeight*particleRatio);
    particleContext.setTransform(particleRatio,0,0,particleRatio,0,0);
    if(!oldWidth||!oldHeight||!finalParticles.length) seedFinalParticles();
    if(oldWidth&&oldHeight){
      for(let i=0;i<particleRainIndex;i++){
        const p=finalParticles[i];
        p.x=Math.min(particleWidth-4,p.x*(particleWidth/oldWidth));
        if(p.settled) p.y=particleHeight-8-p.size;
      }
    }
  }

  function addFinalParticle(x,y,force){
    const angle=Math.random()*Math.PI*2;
    const speed=(.5+Math.random()*2.2)*force;
    let p;
    if(particleRainIndex<particleCap){p=finalParticles[particleRainIndex];particleRainIndex++;}
    else{p=finalParticles[particleRecycleIndex];particleRecycleIndex=(particleRecycleIndex+1)%particleCap;}
    p.x=x;p.y=y;
    p.vx=Math.cos(angle)*speed;p.vy=Math.sin(angle)*speed-1.2*force;
    p.size=2.2+Math.random()*4.4;
    p.rotation=Math.random()*Math.PI;p.spin=(Math.random()-.5)*.16;
    p.life=1;p.active=true;p.settled=false;
    p.shape=Math.floor(Math.random()*4);
    p.color=particleColors[Math.floor(Math.random()*particleColors.length)];
  }

  function emitFinalParticles(amount,force){
    for(let i=0;i<amount;i++) addFinalParticle(pointer.x+(Math.random()-.5)*18,pointer.y+(Math.random()-.5)*12,force);
  }

  function disturbFinalParticles(){
    const radius=58;
    const radiusSquared=radius*radius;
    for(let i=0;i<particleRainIndex;i++){
      const p=finalParticles[i];
      if(!p.active||!p.settled) continue;
      const dx=p.x-pointer.x;
      const dy=p.y-pointer.y;
      const distanceSquared=dx*dx+dy*dy;
      if(distanceSquared>radiusSquared) continue;
      const distance=Math.sqrt(distanceSquared)||1;
      const force=(1-distance/radius)*5.5;
      p.vx=dx/distance*force+(Math.random()-.5)*1.2;
      p.vy=-2.2-Math.random()*force;
      p.spin=(Math.random()-.5)*.2;
      p.settled=false;
    }
  }

  function drawFinalGlyph(p){
    particleContext.save();
    particleContext.translate(p.x,p.y);
    particleContext.rotate(p.rotation);
    particleContext.globalAlpha=Math.max(0,p.life);
    particleContext.fillStyle=p.color;
    particleContext.strokeStyle=p.color;
    particleContext.lineWidth=1.4;
    if(p.shape===0) particleContext.fillRect(-p.size,-p.size,p.size*2,p.size*2);
    else if(p.shape===1){particleContext.beginPath();particleContext.arc(0,0,p.size,0,Math.PI*2);particleContext.fill();}
    else if(p.shape===2){particleContext.beginPath();particleContext.moveTo(0,-p.size*1.25);particleContext.lineTo(p.size,p.size);particleContext.lineTo(-p.size,p.size);particleContext.closePath();particleContext.fill();}
    else{particleContext.beginPath();particleContext.moveTo(-p.size,0);particleContext.lineTo(p.size,0);particleContext.moveTo(0,-p.size);particleContext.lineTo(0,p.size);particleContext.stroke();}
    particleContext.restore();
  }

  function drawFinalParticles(time){
    particleFrame=0;
    particleContext.clearRect(0,0,particleWidth,particleHeight);
    if(pointer.inside&&pointer.pressed) emitFinalParticles(10,1.3);
    pointer.moved=false;
    const floor=particleHeight-8;
    let hasMovingParticles=false;
    for(let i=finalParticles.length-1;i>=0;i--){
      const p=finalParticles[i];
      if(!p.active) continue;
      if(!p.settled){
        hasMovingParticles=true;
        p.vy+=.12;
        p.vx*=.986;
        p.vy*=.992;
        p.x+=p.vx;
        p.y+=p.vy;
        p.rotation+=p.spin;
      }
      if(p.y>floor-p.size){
        p.y=floor-p.size;
        if(Math.abs(p.vy)<1.05){p.vy=0;p.vx=0;p.spin=0;p.settled=true;}
        else{p.vy*=-.3;p.vx*=.78;}
      }
      if(p.x<4){p.x=4;p.vx=Math.abs(p.vx)*.65;}
      if(p.x>particleWidth-4){p.x=particleWidth-4;p.vx=-Math.abs(p.vx)*.65;}
      drawFinalGlyph(p);
    }
    if(particleVisible&&(hasMovingParticles||pointer.pressed||time-particleLast<120)) particleFrame=requestAnimationFrame(drawFinalParticles);
  }

  function requestFinalParticles(){if(!particleFrame&&particleVisible) particleFrame=requestAnimationFrame(drawFinalParticles);}
  function locateFinalPointer(event){
    const rect=finalParticleBox.getBoundingClientRect();
    pointer.x=Math.max(0,Math.min(rect.width,event.clientX-rect.left));
    pointer.y=Math.max(0,Math.min(rect.height,event.clientY-rect.top));
    pointer.inside=true;
    pointer.moved=true;
    particleLast=performance.now();
    disturbFinalParticles();
    emitFinalParticles(event.pointerType==='touch'?14:5,event.pointerType==='touch'?1.35:.9);
    requestFinalParticles();
  }
  finalParticleBox.addEventListener('pointerenter',locateFinalPointer,{passive:true});
  finalParticleBox.addEventListener('pointermove',locateFinalPointer,{passive:true});
  finalParticleBox.addEventListener('pointerdown',event=>{locateFinalPointer(event);pointer.pressed=true;emitFinalParticles(event.pointerType==='touch'?32:22,1.5);requestFinalParticles();},{passive:true});
  finalParticleBox.addEventListener('pointerup',()=>{pointer.pressed=false;},{passive:true});
  finalParticleBox.addEventListener('pointercancel',()=>{pointer.pressed=false;pointer.inside=false;},{passive:true});
  finalParticleBox.addEventListener('pointerleave',()=>{pointer.pressed=false;pointer.inside=false;},{passive:true});
  addEventListener('resize',()=>{resizeFinalParticles();requestFinalParticles();},{passive:true});
  new IntersectionObserver(entries=>{particleVisible=entries[0].isIntersecting;if(particleVisible){resizeFinalParticles();requestFinalParticles();}},{threshold:.05}).observe(finalParticleBox);
  resizeFinalParticles();
}
