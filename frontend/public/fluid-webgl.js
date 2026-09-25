import * as THREE from 'three';

const canvas = document.querySelector('#fluid-cursor');
const finePointer = matchMedia('(pointer:fine)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;

if (canvas && finePointer && !reducedMotion) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: false });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const MAX_DROPS = 22;
  const drops = new Array(MAX_DROPS);
  for (let i = 0; i < MAX_DROPS; i++) drops[i] = new THREE.Vector4(-10, -10, 99, 0);

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
      uDrops: { value: drops }
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv=uv; gl_Position=vec4(position,1.0); }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform vec4 uDrops[${MAX_DROPS}];
      void main(){
        vec2 uv=vUv;
        float aspect=uResolution.x/uResolution.y;
        vec2 normal=vec2(0.0);
        float field=0.0;
        for(int i=0;i<${MAX_DROPS};i++){
          vec4 r=uDrops[i];
          float age=r.z;
          if(age>1.05) continue;
          vec2 delta=uv-r.xy;
          delta.x*=aspect;
          float d=max(length(delta),.0001);
          float blob=exp(-d*d*520.0)*exp(-age*3.15)*r.w;
          field+=blob;
          normal-=delta*blob*34.0;
        }
        float n=length(normal);
        float body=smoothstep(.018,.48,field);
        float glass=smoothstep(.02,.7,field)*(1.0-smoothstep(.7,1.65,field));
        float light=clamp(normal.x*.55-normal.y*.25+.35,0.0,1.0);
        vec3 deep=vec3(.57,.72,.78);
        vec3 clear=vec3(.92,.98,1.0);
        vec3 color=mix(deep,clear,light);
        color=mix(color,vec3(.72,.86,.91),glass*.45);
        float alpha=body*(.055+glass*.075)+n*.018;
        alpha=clamp(alpha,0.0,.16);
        gl_FragColor=vec4(color,alpha);
      }
    `
  });
  scene.add(new THREE.Mesh(geometry, material));

  let width = innerWidth, height = innerHeight;
  let index = 0, running = false, lastTime = performance.now();
  let previousX = width * .5, previousY = height * .5;

  function resize(){
    width=innerWidth; height=innerHeight;
    renderer.setSize(width,height,false);
    material.uniforms.uResolution.value.set(width,height);
  }
  resize();
  addEventListener('resize', resize, { passive:true });

  function addRipple(x,y,strength){
    const r=drops[index++%MAX_DROPS];
    r.set(x/width,1-y/height,0,strength);
  }
  addEventListener('pointermove',event=>{
    const dx=event.clientX-previousX,dy=event.clientY-previousY;
    const distance=Math.sqrt(dx*dx+dy*dy);
    const steps=Math.min(8,Math.max(1,Math.ceil(distance/12)));
    const strength=Math.min(.62+distance/58,1.32);
    for(let i=1;i<=steps;i++){
      const t=i/steps;
      addRipple(previousX+dx*t,previousY+dy*t,strength);
    }
    previousX=event.clientX; previousY=event.clientY;
    if(!running){ running=true; lastTime=performance.now(); requestAnimationFrame(render); }
  },{passive:true});

  function render(now){
    const dt=Math.min((now-lastTime)/1000,.04);
    lastTime=now;
    let active=0;
    for(let i=0;i<MAX_DROPS;i++){
      if(drops[i].z<=1.05){ drops[i].z+=dt; active++; }
    }
    renderer.render(scene,camera);
    if(active>0) requestAnimationFrame(render);
    else { running=false; renderer.clear(); }
  }
} else if (canvas) canvas.style.display='none';
