const Drawing = {
drawPixelRect(x,y,w,h,color){
  X.fillStyle=color;X.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h));
},

getDaylight(){
  let t=S.h+S.m/60;
  if(t>=5&&t<7)return(t-5)/2;
  if(t>=7&&t<17)return 1;
  if(t>=17&&t<20)return 1-(t-17)/3;
  return 0;
},

drawSky(){
  let skyH=sceneTop-5;
  let dl=getDaylight();
  let nightAlpha=1-dl;
  let g=X.createLinearGradient(0,0,0,skyH);
  if(S.weather==='karlı'){
    g.addColorStop(0,`rgba(180,195,210,${0.3+dl*0.7})`);
    g.addColorStop(0.5,`rgba(200,210,220,${0.3+dl*0.7})`);
    g.addColorStop(1,`rgba(210,220,215,${0.3+dl*0.7})`);
  }else if(S.weather==='yağmurlu'){
    g.addColorStop(0,`rgba(120,130,145,${0.4+dl*0.6})`);
    g.addColorStop(0.5,`rgba(140,150,160,${0.4+dl*0.6})`);
    g.addColorStop(1,`rgba(160,170,165,${0.4+dl*0.6})`);
  }else if(S.weather==='bulutlu'){
    g.addColorStop(0,`rgba(170,190,210,${0.5+dl*0.5})`);
    g.addColorStop(0.5,`rgba(190,205,220,${0.5+dl*0.5})`);
    g.addColorStop(1,`rgba(200,215,200,${0.5+dl*0.5})`);
  }else{
    g.addColorStop(0,`rgba(40,60,${80+dl*100},${0.3+dl*0.7})`);
    g.addColorStop(0.3,`rgba(135,206,235,${0.3+dl*0.7})`);
    g.addColorStop(0.7,`rgba(176,224,255,${0.3+dl*0.7})`);
    g.addColorStop(1,`rgba(200,230,200,${0.3+dl*0.7})`);
  }
  X.fillStyle=g;X.fillRect(0,0,W,skyH);
  // Gunes veya ay
  let sunY=skyH*0.3+skyH*0.4*(1-dl);
  let sunX=W*0.6;
  // Gunes etrafindaki kararmis bolge (dogma/batma)
  let hourF=S.h+S.m/60;
  let sunGlowAlpha=0;
  if(hourF>=5&&hourF<7)sunGlowAlpha=(1-(hourF-5)/2)*0.4;
  else if(hourF>=17&&hourF<20)sunGlowAlpha=((hourF-17)/3)*0.4;
  if(sunGlowAlpha>0.01){
    let glowR=skyH*0.6;
    let sgGrd=X.createRadialGradient(sunX,sunY,0,sunX,sunY,glowR);
    sgGrd.addColorStop(0,`rgba(255,180,50,${sunGlowAlpha*0.6})`);
    sgGrd.addColorStop(0.3,`rgba(255,120,30,${sunGlowAlpha*0.3})`);
    sgGrd.addColorStop(0.6,`rgba(180,60,20,${sunGlowAlpha*0.15})`);
    sgGrd.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=sgGrd;
    X.beginPath();X.arc(sunX,sunY,glowR,0,Math.PI*2);X.fill();
  }
  if(dl>0.1){
    X.fillStyle=`rgba(255,220,50,${dl*0.9})`;
    X.beginPath();X.arc(sunX,sunY,18,0,Math.PI*2);X.fill();
    X.fillStyle=`rgba(255,240,150,${dl*0.3})`;
    X.beginPath();X.arc(sunX,sunY,28,0,Math.PI*2);X.fill();
  }
  if(dl<0.5){
    X.fillStyle=`rgba(220,230,250,${(0.5-dl)*1.5})`;
    X.beginPath();X.arc(sunX,sunY,12,0,Math.PI*2);X.fill();
  }
  // Bulutlar
  let cloudCount=S.weather==='güneşli'?3:S.weather==='bulutlu'?8:S.weather==='yağmurlu'?10:6;
  let cloudAlpha=S.weather==='güneşli'?0.5:S.weather==='bulutlu'?0.7:0.8;
  let t=Date.now()/8000;
  for(let i=0;i<cloudCount;i++){
    let cx=(W*0.1+i*W*0.12+Math.sin(t+i*0.8)*15)%W;
    let cy=12+Math.sin(t*0.5+i*2)*6+i%3*10;
    X.fillStyle=S.weather==='yağmurlu'?`rgba(120,130,140,${cloudAlpha})`:
                S.weather==='karlı'?`rgba(190,200,210,${cloudAlpha})`:`rgba(255,255,255,${cloudAlpha})`;
    X.beginPath();X.arc(cx,cy,12+i%3*3,0,Math.PI*2);X.fill();
    X.beginPath();X.arc(cx-10,cy+3,10+i%2*2,0,Math.PI*2);X.fill();
    X.beginPath();X.arc(cx+10,cy+3,10+i%2*2,0,Math.PI*2);X.fill();
  }
  // Yagmur efekti
  if(S.weather==='yağmurlu'){
    X.strokeStyle='rgba(150,180,220,0.5)';X.lineWidth=1;
    for(let i=0;i<rainDrops.length;i++){
      let rd=rainDrops[i];
      X.beginPath();X.moveTo(rd.x,rd.y);X.lineTo(rd.x-2,rd.y+8);X.stroke();
      rd.y+=rd.spd;rd.x-=1;
      if(rd.y>H-48){rainDrops[i]={x:Math.random()*W,y:-5,spd:4+Math.random()*4}}
    }
  }
  // Kar efekti
  if(S.weather==='karlı'){
    X.fillStyle='rgba(255,255,255,0.8)';
    for(let i=0;i<snowFlakes.length;i++){
      let sf=snowFlakes[i];
      X.beginPath();X.arc(sf.x,sf.y,sf.r,0,Math.PI*2);X.fill();
      sf.y+=sf.spd;sf.x+=Math.sin(Date.now()/1000+i)*0.5;
      if(sf.y>H-48){snowFlakes[i]={x:Math.random()*W,y:-5,r:1+Math.random()*2,spd:1+Math.random()*2}}
    }
  }
  // Gun isigi overlay (gece karanligi)
  if(nightAlpha>0.05){
    X.fillStyle=`rgba(10,10,40,${nightAlpha*0.55})`;
    X.fillRect(0,0,W,H);
  }
},

drawMountains(){
  let baseY=sceneTop+5;
  X.fillStyle='#5a8a4a';
  X.beginPath();X.moveTo(0,baseY);
  for(let x=0;x<=W;x+=W/8){
    X.lineTo(x,baseY-30-Math.sin(x*0.003)*25-Math.cos(x*0.007)*15);
  }
  X.lineTo(W,baseY);X.closePath();X.fill();
  X.fillStyle='#4a7a3a';
  X.beginPath();X.moveTo(0,baseY);
  for(let x=0;x<=W;x+=W/12){
    X.lineTo(x,baseY-15-Math.sin(x*0.005+1)*18-Math.cos(x*0.003)*10);
  }
  X.lineTo(W,baseY);X.closePath();X.fill();
},

drawGrassBackground(){
  let g=X.createLinearGradient(0,sceneTop-5,0,H);
  g.addColorStop(0,'#5da832');g.addColorStop(0.05,'#4e9a2e');g.addColorStop(1,'#3d8a22');
  X.fillStyle=g;X.fillRect(0,sceneTop-5,W,H-sceneTop+5);
  for(let i=0;i<80;i++){
    let gx=(i*173+23)%W,gy=sceneTop+((i*293+47)%(H-sceneTop-50));
    X.strokeStyle=i%3?'rgba(80,180,50,0.3)':'rgba(60,140,30,0.25)';
    X.lineWidth=0.8;
    X.beginPath();X.moveTo(gx,gy);X.lineTo(gx+1,gy-4-i%3);X.stroke();
  }
},

drawDirtPath(x1,y1,x2,y2,width){
  X.fillStyle='rgba(160,120,70,0.6)';
  let dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  let nx=-dy/len*width/2,ny=dx/len*width/2;
  X.beginPath();
  X.moveTo(x1+nx,y1+ny);X.lineTo(x2+nx,y2+ny);
  X.lineTo(x2-nx,y2-ny);X.lineTo(x1-nx,y1-ny);
  X.closePath();X.fill();
  X.fillStyle='rgba(140,100,55,0.3)';
  for(let i=0;i<len;i+=12){
    let t=i/len;
    let px=x1+dx*t+(Math.sin(i*0.5)*3);
    let py=y1+dy*t;
    X.beginPath();X.ellipse(px,py,2,1,0,0,Math.PI*2);X.fill();
  }
},

drawFenceSegment(x1,y1,x2,y2){
  let dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  let ux=dx/len,uy=dy/len;
  X.strokeStyle='#6d4c41';X.lineWidth=2;
  X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.stroke();
  X.beginPath();X.moveTo(x1,y1-4);X.lineTo(x2,y2-4);X.stroke();
  let posts=Math.floor(len/15);
  for(let i=0;i<=posts;i++){
    let px=x1+ux*i*15,py=y1+uy*i*15;
    X.fillStyle='#5d4037';X.fillRect(px-1.5,py-6,3,8);
    X.fillStyle='#4e342e';X.beginPath();X.arc(px,py-6,2,0,Math.PI*2);X.fill();
  }
},

drawRoads(hx,hy,gridCX,gridCY,gridRight,gridBottom,houseS){
  let targets=[];
  if(S.built.kuyu){
    let kx,ky;
    if(S.buildingPos.kuyu){kx=S.buildingPos.kuyu.x;ky=S.buildingPos.kuyu.y}
    else if(S.built.grid){kx=gridCX;ky=gridBottom+CL*1.5}
    else{kx=W*0.5;ky=GY+CL*3}
    targets.push({x:kx,y:ky,k:'kuyu'});
  }
  if(S.built.ahır){
    let ax,ay;
    if(S.buildingPos.ahır){ax=S.buildingPos.ahır.x;ay=S.buildingPos.ahır.y}
    else{ax=S.built.grid?Math.max(gridRight+CL*1.0,Math.min(W*0.88,gridRight+CL*2.5+CL*0.5)):W*0.88;ay=sceneTop+Math.floor((H-86)*0.02)}
    targets.push({x:ax,y:ay,k:'ahır'});
  }
  if(S.built.kümes){
    let kx,ky;
    if(S.buildingPos.kümes){kx=S.buildingPos.kümes.x;ky=S.buildingPos.kümes.y}
    else{
      let ax2;if(S.buildingPos.ahır)ax2=S.buildingPos.ahır.x;else ax2=S.built.grid?Math.max(gridRight+CL,Math.min(W*0.88,gridRight+CL*3)):W*0.88;
      let ay2;if(S.buildingPos.ahır)ay2=S.buildingPos.ahır.y;else ay2=sceneTop+2;
      kx=ax2;ky=ay2+CL*5;
    }
    targets.push({x:kx,y:ky,k:'kümes'});
  }
  if(S.built.degirmen){
    let dx,dy;
    if(S.buildingPos.degirmen){dx=S.buildingPos.degirmen.x;dy=S.buildingPos.degirmen.y}
    else{dx=hx;dy=hy+houseS*1.5}
    targets.push({x:dx,y:dy,k:'degirmen'});
  }
  if(S.built.fırın){
    let fx,fy;
    if(S.buildingPos.fırın){fx=S.buildingPos.fırın.x;fy=S.buildingPos.fırın.y}
    else{let fs=CL*(ISLANDSCAPE?2.0:1.6);fx=gridRight+fs*1.2;fy=sceneTop+fs*1.8;if(fx+fs>W-fs){fx=hx+houseS*1.5;fy=hy+houseS*1.8}}
    targets.push({x:fx,y:fy,k:'fırın'});
  }
  if(S.built.sutislem){
    let sx,sy;
    if(S.buildingPos.sutislem){sx=S.buildingPos.sutislem.x;sy=S.buildingPos.sutislem.y}
    else{sx=gridRight+CL*2;sy=sceneTop+CL*2}
    targets.push({x:sx,y:sy,k:'sutislem'});
  }
  if(S.built.peynirfab){
    let px,py;
    if(S.buildingPos.peynirfab){px=S.buildingPos.peynirfab.x;py=S.buildingPos.peynirfab.y}
    else{px=gridRight+CL*2;py=sceneTop+CL*5}
    targets.push({x:px,y:py,k:'peynirfab'});
  }
  if(S.built.salçafab){
    let sx,sy;
    if(S.buildingPos.salçafab){sx=S.buildingPos.salçafab.x;sy=S.buildingPos.salçafab.y}
    else{sx=gridRight+CL*2;sy=sceneTop+CL*8}
    targets.push({x:sx,y:sy,k:'salçafab'});
  }
  if(targets.length===0)return;
  let roadW=CL*0.45;
  let stoneS=CL*0.22;
  let rl=S.roadLevel||0;
  function drawRoadSegment(x1,y1,x2,y2){
    let dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    if(len<1)return;
    let ux=dx/len,uy=dy/len;
    let nx=-uy,ny=ux;
    let hw=roadW/2;
    if(rl===0){
      X.fillStyle='#a0825a';
      X.beginPath();
      X.moveTo(x1+nx*hw,y1+ny*hw);
      X.lineTo(x2+nx*hw,y2+ny*hw);
      X.lineTo(x2-nx*hw,y2-ny*hw);
      X.lineTo(x1-nx*hw,y1-ny*hw);
      X.closePath();X.fill();
      X.strokeStyle='#8a6e42';X.lineWidth=1;
      X.beginPath();X.moveTo(x1+nx*hw,y1+ny*hw);X.lineTo(x2+nx*hw,y2+ny*hw);X.stroke();
      X.beginPath();X.moveTo(x1-nx*hw,y1-ny*hw);X.lineTo(x2-nx*hw,y2-ny*hw);X.stroke();
      let dots=Math.floor(len/(stoneS*1.5));
      for(let i=0;i<dots;i++){
        let t=(i+0.3)/dots;
        let cx=x1+dx*t,cy=y1+dy*t;
        let sh=((i*5+2)%7)/7*20-10;
        X.fillStyle=`rgb(${145+sh},${115+sh},${75+sh})`;
        X.beginPath();X.arc(cx+nx*((i%3-1)*hw*0.3),cy+ny*((i%3-1)*hw*0.3),stoneS*0.18,0,Math.PI*2);X.fill();
      }
    }else if(rl===1){
      X.fillStyle='#8d8d8d';
      X.beginPath();
      X.moveTo(x1+nx*hw,y1+ny*hw);
      X.lineTo(x2+nx*hw,y2+ny*hw);
      X.lineTo(x2-nx*hw,y2-ny*hw);
      X.lineTo(x1-nx*hw,y1-ny*hw);
      X.closePath();X.fill();
      X.strokeStyle='#6d6d6d';X.lineWidth=1;
      X.beginPath();X.moveTo(x1+nx*hw,y1+ny*hw);X.lineTo(x2+nx*hw,y2+ny*hw);X.stroke();
      X.beginPath();X.moveTo(x1-nx*hw,y1-ny*hw);X.lineTo(x2-nx*hw,y2-ny*hw);X.stroke();
      let tiles=Math.floor(len/stoneS);
      for(let i=0;i<tiles;i++){
        let t=i/tiles;
        let cx=x1+dx*t,cy=y1+dy*t;
        let shade=((i*7+3)%5)/5*30-15;
        X.fillStyle=`rgb(${160+shade},${155+shade},${145+shade})`;
        X.fillRect(cx-stoneS*0.42,cy-stoneS*0.35,stoneS*0.84,stoneS*0.7);
        X.strokeStyle='#999';X.lineWidth=0.5;
        X.strokeRect(cx-stoneS*0.42,cy-stoneS*0.35,stoneS*0.84,stoneS*0.7);
      }
    }else{
      hw=roadW*0.55/2;
      X.fillStyle='#3a3a3a';
      X.beginPath();
      X.moveTo(x1+nx*hw,y1+ny*hw);
      X.lineTo(x2+nx*hw,y2+ny*hw);
      X.lineTo(x2-nx*hw,y2-ny*hw);
      X.lineTo(x1-nx*hw,y1-ny*hw);
      X.closePath();X.fill();
      X.strokeStyle='#555';X.lineWidth=1.5;
      X.beginPath();X.moveTo(x1+nx*hw,y1+ny*hw);X.lineTo(x2+nx*hw,y2+ny*hw);X.stroke();
      X.beginPath();X.moveTo(x1-nx*hw,y1-ny*hw);X.lineTo(x2-nx*hw,y2-ny*hw);X.stroke();
      let dashLen=CL*0.3,dashGap=CL*0.2;
      let total=dashLen+dashGap;
      let dashes=Math.floor(len/total);
      X.strokeStyle='#e0c848';X.lineWidth=1.5;
      for(let i=0;i<dashes;i++){
        let t0=(i*total)/len,t1=(i*total+dashLen)/len;
        if(t1>1)break;
        X.beginPath();
        X.moveTo(x1+dx*t0,y1+dy*t0);X.lineTo(x1+dx*t1,y1+dy*t1);X.stroke();
      }
    }
  }
  let connected=[{x:hx,y:hy}];
  let remaining=[...targets];
  while(remaining.length>0){
    let bestDist=Infinity,bestC=-1,bestR=-1;
    for(let c=0;c<connected.length;c++){
      for(let r=0;r<remaining.length;r++){
        let dx=remaining[r].x-connected[c].x,dy=remaining[r].y-connected[c].y;
        let d=Math.sqrt(dx*dx+dy*dy);
        if(d<bestDist){bestDist=d;bestC=c;bestR=r}
      }
    }
    if(bestR<0)break;
    let from=connected[bestC];
    let to=remaining[bestR];
    let midX=to.x,midY=from.y;
    drawRoadSegment(from.x,from.y,midX,midY);
    drawRoadSegment(midX,midY,to.x,to.y);
    connected.push(to);
    remaining.splice(bestR,1);
  }
},

drawPickup(x,y,type,angle){
  X.save();X.translate(x,y);X.rotate(angle);
  let s=CL*0.8;
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.5,s*0.55,s*0.06,0,0,Math.PI*2);X.fill();
  X.fillStyle='#f5f5f5';X.fillRect(-s*0.4,-s*0.25,s*0.8,s*0.35);
  X.fillStyle='#e0e0e0';X.fillRect(-s*0.38,-s*0.22,s*0.76,s*0.02);
  X.fillStyle='#42a5f5';X.fillRect(-s*0.35,-s*0.2,s*0.3,s*0.15);
  X.fillStyle='#90a4ae';X.fillRect(s*0.1,-s*0.2,s*0.25,s*0.25);
  X.fillStyle='#333';X.beginPath();X.arc(-s*0.25,s*0.12,s*0.06,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.25,s*0.12,s*0.06,0,Math.PI*2);X.fill();
  X.fillStyle='#555';X.beginPath();X.arc(-s*0.25,s*0.12,s*0.03,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.25,s*0.12,s*0.03,0,Math.PI*2);X.fill();
  if(type==='milk'){
    X.font=`bold ${s*0.3}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.textBaseline='middle';
    X.fillText('🥛',0,-s*0.35);
  }else if(type==='egg'){
    X.font=`bold ${s*0.3}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.textBaseline='middle';
    X.fillText('🥚',0,-s*0.35);
  }
  X.restore();
},

drawHouse(x,y,s){
  X.save();X.translate(x,y);

  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.82,s*0.85,s*0.1,0,0,Math.PI*2);X.fill();

  // Taş temel
  let stoneColors=['#9e9e9e','#bdbdbd','#8d8d8d','#a8a8a8'];
  for(let i=0;i<Math.ceil(s*0.6/6);i++){
    for(let j=0;j<4;j++){
      let sx=-s*0.52+j*s*0.27+(i%2)*s*0.13;
      let sy=s*0.78-i*6;
      X.fillStyle=stoneColors[(i+j)%4];
      X.beginPath();X.roundRect(sx,sy,s*0.25,5,1);X.fill();
      X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.5;X.stroke();
    }
  }

  // Ahşap gövde - tahta desenli
  let wallColors=['#8B6914','#9B7924','#7B5904','#a08930','#8B7514','#9a7820','#7d6010','#a89040'];
  for(let i=0;i<10;i++){
    X.fillStyle=wallColors[i%wallColors.length];
    X.fillRect(-s*0.5,s*0.1+i*s*0.07,s,s*0.07);
    X.strokeStyle='rgba(0,0,0,0.08)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(-s*0.5,s*0.1+i*s*0.07);X.lineTo(s*0.5,s*0.1+i*s*0.07);X.stroke();
  }

  // Tahta kenar çerçevesi
  X.fillStyle='#5d4037';X.fillRect(-s*0.52,s*0.08,s*1.04,s*0.03);
  X.fillRect(-s*0.52,s*0.78,s*1.04,s*0.03);
  X.fillRect(-s*0.52,s*0.08,s*0.03,s*0.73);
  X.fillRect(s*0.49,s*0.08,s*0.03,s*0.73);

  // Çatı - kiremit desenli
  X.fillStyle='#8B4513';
  X.beginPath();X.moveTo(-s*0.62,s*0.1);X.lineTo(0,-s*0.32);X.lineTo(s*0.62,s*0.1);X.closePath();X.fill();
  // Çatı katmanları - kiremit sıraları
  for(let i=0;i<6;i++){
    let ry=s*0.1-i*s*0.068;
    let rw=s*(0.62-i*0.08);
    X.fillStyle=i%2?'#A0522D':'#7B3F00';
    X.beginPath();X.moveTo(-rw,ry);X.lineTo(rw,ry);X.lineTo(rw-s*0.02,ry-s*0.065);X.lineTo(-rw+s*0.02,ry-s*0.065);X.closePath();X.fill();
    // Kiremit dikey çizgileri
    X.strokeStyle='rgba(0,0,0,0.12)';X.lineWidth=0.5;
    for(let j=-rw+s*0.04;j<rw;j+=s*0.08){
      X.beginPath();X.moveTo(j,ry);X.lineTo(j-s*0.01,ry-s*0.065);X.stroke();
    }
  }
  // Çatı kenar bordür
  X.strokeStyle='#5d4037';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.62,s*0.1);X.lineTo(0,-s*0.32);X.lineTo(s*0.62,s*0.1);X.stroke();

  // Bacak - tuğla desenli
  X.fillStyle='#8B4513';X.fillRect(s*0.15,-s*0.28,s*0.1,s*0.32);
  for(let i=0;i<4;i++){
    X.fillStyle=i%2?'#9B5B43':'#7B3523';
    X.fillRect(s*0.15,-s*0.25+i*s*0.08,s*0.1,s*0.07);
    X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.5;
    X.strokeRect(s*0.15,-s*0.25+i*s*0.08,s*0.1,s*0.07);
  }
  X.fillStyle='#555';X.beginPath();X.arc(s*0.2,-s*0.3,s*0.045,0,Math.PI*2);X.fill();
  // Duman animasyonu
  let t=Date.now()/1000;
  for(let i=0;i<3;i++){
    let dx=s*0.2+Math.sin(t*1.5+i*2)*s*0.04;
    let dy=-s*0.35-i*s*0.08-Math.sin(t+i)*s*0.02;
    let dr=s*0.03+i*s*0.015;
    let alpha=0.35-i*0.1;
    X.fillStyle=`rgba(180,180,180,${alpha})`;
    X.beginPath();X.arc(dx,dy,dr+Math.sin(t*2+i)*1.5,0,Math.PI*2);X.fill();
  }

  // Kapı - detaylı
  X.fillStyle='#5d4037';X.fillRect(-s*0.12,s*0.35,s*0.24,s*0.43);
  X.fillStyle='#4e342e';X.fillRect(-s*0.1,s*0.37,s*0.2,s*0.39);
  // Kapı çerçevesi
  X.strokeStyle='#8d6e63';X.lineWidth=1.5;X.strokeRect(-s*0.1,s*0.37,s*0.2,s*0.39);
  // Kapı paneelleri
  X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.8;
  X.strokeRect(-s*0.07,s*0.39,s*0.14,s*0.15);
  X.strokeRect(-s*0.07,s*0.56,s*0.14,s*0.15);
  // Kapı kulpu
  X.fillStyle='#ffe082';X.beginPath();X.arc(s*0.06,s*0.58,2,0,Math.PI*2);X.fill();
  // Kapı üstü sundurma
  X.fillStyle='#654321';
  X.beginPath();X.moveTo(-s*0.2,s*0.35);X.lineTo(0,s*0.28);X.lineTo(s*0.2,s*0.35);X.closePath();X.fill();
  X.strokeStyle='#5d4037';X.lineWidth=1;X.beginPath();X.moveTo(-s*0.2,s*0.35);X.lineTo(0,s*0.28);X.lineTo(s*0.2,s*0.35);X.stroke();

  // Pencereler - sol
  let winW=s*0.13,winH=s*0.1;
  X.fillStyle='#87CEEB';X.fillRect(-s*0.42,s*0.22,winW,winH);
  X.fillStyle='rgba(255,255,255,0.25)';X.fillRect(-s*0.4,s*0.24,winW*0.4,winH*0.4);
  X.strokeStyle='#5d4037';X.lineWidth=1.5;X.strokeRect(-s*0.42,s*0.22,winW,winH);
  X.beginPath();X.moveTo(-s*0.42+winW/2,s*0.22);X.lineTo(-s*0.42+winW/2,s*0.22+winH);X.stroke();
  X.beginPath();X.moveTo(-s*0.42,s*0.22+winH/2);X.lineTo(-s*0.42+winW,s*0.22+winH/2);X.stroke();
  // Çiçek kutusu - sol pencere
  X.fillStyle='#6d4c41';X.fillRect(-s*0.44,s*0.22+winH+2,winW+4,6);
  let cf1=['#e91e63','#ff9800','#ffeb3b','#9c27b0'];
  for(let i=0;i<4;i++){
    let cfx=-s*0.43+i*(winW+2)/4+3;
    X.fillStyle='#4caf50';X.fillRect(cfx,s*0.22+winH-2,1.5,4);
    X.fillStyle=cf1[i];
    X.beginPath();X.arc(cfx,s*0.22+winH-3,2.5,0,Math.PI*2);X.fill();
  }

  // Pencereler - sağ
  X.fillStyle='#87CEEB';X.fillRect(s*0.29,s*0.22,winW,winH);
  X.fillStyle='rgba(255,255,255,0.25)';X.fillRect(s*0.31,s*0.24,winW*0.4,winH*0.4);
  X.strokeStyle='#5d4037';X.lineWidth=1.5;X.strokeRect(s*0.29,s*0.22,winW,winH);
  X.beginPath();X.moveTo(s*0.29+winW/2,s*0.22);X.lineTo(s*0.29+winW/2,s*0.22+winH);X.stroke();
  X.beginPath();X.moveTo(s*0.29,s*0.22+winH/2);X.lineTo(s*0.29+winW,s*0.22+winH/2);X.stroke();
  // Çiçek kutusu - sağ pencere
  X.fillStyle='#6d4c41';X.fillRect(s*0.27,s*0.22+winH+2,winW+4,6);
  for(let i=0;i<4;i++){
    let cfx=s*0.28+i*(winW+2)/4+3;
    X.fillStyle='#4caf50';X.fillRect(cfx,s*0.22+winH-2,1.5,4);
    X.fillStyle=cf1[(i+2)%4];
    X.beginPath();X.arc(cfx,s*0.22+winH-3,2.5,0,Math.PI*2);X.fill();
  }

  // Veranda / teras - evin onu
  X.fillStyle='#8d6e63';X.fillRect(-s*0.35,s*0.8,s*0.7,s*0.08);
  // Ahşap döşeme çizgileri
  X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
  for(let i=0;i<7;i++){X.beginPath();X.moveTo(-s*0.35+i*s*0.1,s*0.8);X.lineTo(-s*0.35+i*s*0.1,s*0.88);X.stroke()}
  // Veranda sütunları
  X.fillStyle='#a1887f';X.fillRect(-s*0.33,s*0.35,3,s*0.45);
  X.fillRect(s*0.3,s*0.35,3,s*0.45);
  // Sütun başlıkları
  X.fillStyle='#8d6e63';X.fillRect(-s*0.35,s*0.34,7,3);X.fillRect(s*0.28,s*0.34,7,3);

  // Kapı yanında çiçek saksıları
  // Sol saksı
  X.fillStyle='#a1887f';X.beginPath();X.moveTo(-s*0.22,s*0.8);X.lineTo(-s*0.18,s*0.8);X.lineTo(-s*0.19,s*0.72);X.lineTo(-s*0.21,s*0.72);X.closePath();X.fill();
  X.fillStyle='#e91e63';X.beginPath();X.arc(-s*0.2,s*0.7,s*0.03,0,Math.PI*2);X.fill();
  X.fillStyle='#4caf50';X.fillRect(-s*0.2,s*0.7,1.5,s*0.04);
  // Sağ saksı
  X.fillStyle='#a1887f';X.beginPath();X.moveTo(s*0.18,s*0.8);X.lineTo(s*0.22,s*0.8);X.lineTo(s*0.21,s*0.72);X.lineTo(s*0.19,s*0.72);X.closePath();X.fill();
  X.fillStyle='#ff9800';X.beginPath();X.arc(s*0.2,s*0.7,s*0.03,0,Math.PI*2);X.fill();
  X.fillStyle='#4caf50';X.fillRect(s*0.2,s*0.7,1.5,s*0.04);

  X.restore();
},

drawBarn(x,y,s){
  X.save();X.translate(x,y);

  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.82,s*0.95,s*0.1,0,0,Math.PI*2);X.fill();

  // Taş temel
  let stoneC2=['#9e9e9e','#b0b0b0','#888','#a5a5a5'];
  for(let i=0;i<Math.ceil(s*0.5/5);i++){
    for(let j=0;j<5;j++){
      let sx=-s*0.55+j*s*0.23+(i%2)*s*0.11;
      let sy=s*0.78-i*5;
      X.fillStyle=stoneC2[(i+j)%4];
      X.beginPath();X.roundRect(sx,sy,s*0.21,4,1);X.fill();
    }
  }

  // Ahır gövdesi - kırmızı tahta
  let barnColors=['#8B2500','#A03000','#7B1E00','#B03800','#922E00'];
  for(let i=0;i<8;i++){
    X.fillStyle=barnColors[i%barnColors.length];
    X.fillRect(-s*0.55,s*0.12+i*s*0.085,s*1.1,s*0.085);
    X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(-s*0.55,s*0.12+i*s*0.085);X.lineTo(s*0.55,s*0.12+i*s*0.085);X.stroke();
  }
  // Dikey destek ahşapları
  X.fillStyle='#5B0E00';
  X.fillRect(-s*0.55,s*0.12,3,s*0.68);
  X.fillRect(s*0.52,s*0.12,3,s*0.68);
  X.fillRect(-s*0.01,s*0.12,2,s*0.68);

  // Çatı - geniş ahır çatısı
  X.fillStyle='#6B1800';
  X.beginPath();X.moveTo(-s*0.65,s*0.12);X.lineTo(0,-s*0.28);X.lineTo(s*0.65,s*0.12);X.closePath();X.fill();
  // Çatı kiremit
  for(let i=0;i<5;i++){
    let ry=s*0.12-i*s*0.075;
    let rw=s*(0.65-i*0.11);
    X.fillStyle=i%2?'#7B2800':'#5B0E00';
    X.beginPath();X.moveTo(-rw,ry);X.lineTo(rw,ry);X.lineTo(rw-s*0.02,ry-s*0.07);X.lineTo(-rw+s*0.02,ry-s*0.07);X.closePath();X.fill();
    X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
    for(let j=-rw+s*0.05;j<rw;j+=s*0.09){
      X.beginPath();X.moveTo(j,ry);X.lineTo(j-s*0.01,ry-s*0.07);X.stroke();
    }
  }
  // Çatı kenar bordür
  X.strokeStyle='#4a1000';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.65,s*0.12);X.lineTo(0,-s*0.28);X.lineTo(s*0.65,s*0.12);X.stroke();
  // Çatı tepesi
  X.fillStyle='#5B0E00';X.fillRect(-s*0.08,-s*0.3,s*0.16,s*0.04);

  // "AHİR" tabelası - zeminin hemen altında, büyük ve okunaklı
  X.fillStyle='#d4a040';
  X.beginPath();X.roundRect(-s*0.22,s*0.0,s*0.44,s*0.13,3);X.fill();
  X.strokeStyle='#8d6e63';X.lineWidth=1.5;X.strokeRect(-s*0.22,s*0.0,s*0.44,s*0.13);
  X.fillStyle='#3a2010';X.font=`bold ${s*0.1}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.textBaseline='middle';
  X.fillText('AHİR',0,s*0.065);
  X.textBaseline='alphabetic';

  // Ahır kapısı - çift kanat, ortalanmış
  let doorW=s*0.35,doorH=s*0.42;
  let doorTop=s*0.46-doorH/2;
  X.fillStyle='#3e2723';X.fillRect(-doorW/2,doorTop,doorW,doorH);
  // Sol kanat
  X.fillStyle='#2d1b12';X.fillRect(-doorW/2,doorTop,doorW/2-1,doorH);
  // Sağ kanat
  X.fillRect(1,doorTop,doorW/2-1,doorH);
  // Kapı çizgileri
  X.strokeStyle='#1a0f0a';X.lineWidth=1;
  X.strokeRect(-doorW/2,doorTop,doorW/2-1,doorH);
  X.strokeRect(1,doorTop,doorW/2-1,doorH);
  // Çapraz desen
  X.strokeStyle='rgba(100,80,60,0.3)';X.lineWidth=0.8;
  X.beginPath();X.moveTo(-doorW/2,doorTop);X.lineTo(-1,doorTop+doorH);X.stroke();
  X.beginPath();X.moveTo(doorW/2,doorTop);X.lineTo(1,doorTop+doorH);X.stroke();
  // İçerisi karanlık
  X.fillStyle='rgba(10,5,0,0.6)';X.fillRect(-doorW/2+3,doorTop+3,doorW-6,doorH-3);
  // İçerde saman balyası silueti
  X.fillStyle='rgba(200,180,100,0.15)';X.fillRect(-doorW/2+5,doorTop+doorH-8,doorW*0.3,6);
  X.fillStyle='rgba(200,180,100,0.1)';X.fillRect(-doorW/2+doorW*0.4,doorTop+doorH-6,doorW*0.25,4);
  // Kapı kulpları
  X.fillStyle='#ffe082';X.beginPath();X.arc(-4,doorTop+doorH/2,2,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(4,doorTop+doorH/2,2,0,Math.PI*2);X.fill();

  // Pencere - sol taraf
  let pw=s*0.08,ph=s*0.07;
  X.fillStyle='#87CEEB';X.fillRect(-s*0.48,s*0.3,pw,ph);
  X.fillStyle='rgba(255,200,50,0.3)';X.fillRect(-s*0.48,s*0.3,pw,ph);
  X.strokeStyle='#5d4037';X.lineWidth=1;X.strokeRect(-s*0.48,s*0.3,pw,ph);

  // Pencere - sağ taraf
  X.fillStyle='#87CEEB';X.fillRect(s*0.4,s*0.3,pw,ph);
  X.fillStyle='rgba(255,200,50,0.3)';X.fillRect(s*0.4,s*0.3,pw,ph);
  X.strokeStyle='#5d4037';X.strokeRect(s*0.4,s*0.3,pw,ph);

  // Silo
  X.fillStyle='#78909c';X.fillRect(s*0.6,-s*0.35,s*0.22,s*0.9);
  X.fillStyle='#607d8b';X.fillRect(s*0.62,-s*0.33,s*0.18,s*0.86);
  // Silo dikey çizgileri
  X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
  for(let i=0;i<4;i++){X.beginPath();X.moveTo(s*0.62+i*s*0.05,s*0.55);X.lineTo(s*0.62+i*s*0.05,-s*0.33);X.stroke()}
  // Silo kubbe
  X.fillStyle='#B03800';X.beginPath();X.arc(s*0.71,-s*0.35,s*0.14,0,Math.PI*2);X.fill();
  X.fillStyle='#8B2500';X.beginPath();X.arc(s*0.71,-s*0.37,s*0.1,0,Math.PI*2);X.fill();
  // Silo halka
  X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=1.5;
  X.beginPath();X.ellipse(s*0.71,-s*0.15,s*0.14,0.04,0,0,Math.PI*2);X.stroke();
  X.beginPath();X.ellipse(s*0.71,s*0.15,s*0.14,0.04,0,0,Math.PI*2);X.stroke();

  // Seviye göstergesi ve çit
  let bLv=S.buildingLevel?S.buildingLevel.ahır||1:1;
  if(bLv>=2){
    X.fillStyle='rgba(0,0,0,0.4)';X.beginPath();X.roundRect(-s*0.12,-s*0.42,s*0.24,s*0.12,3);X.fill();
    X.fillStyle='#ffd54f';X.font=`bold ${s*0.07}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.fillText('Lv.'+bLv,0,-s*0.34);
  }
  // Çit alanı - seviye ile büyür
  let fW=s*(0.8+bLv*0.08),fH=s*(0.2+bLv*0.03);
  X.strokeStyle='#8B6508';X.lineWidth=2;
  X.strokeRect(-fW/2,s*0.82,fW,fH);
  X.fillStyle='#6B4500';
  for(let i=0;i<Math.min(bLv,5);i++){
    let fx=-fW/2+s*0.06+i*(fW-s*0.12)/Math.min(bLv,5);
    X.fillRect(fx,s*0.84,2,fH-s*0.04);
  }

  X.restore();
},

drawKümes(x,y,s){
  X.save();X.translate(x,y);

  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.82,s*0.95,s*0.1,0,0,Math.PI*2);X.fill();

  // Taş temel
  let stoneC2=['#9e9e9e','#b0b0b0','#888','#a5a5a5'];
  for(let i=0;i<Math.ceil(s*0.5/5);i++){
    for(let j=0;j<5;j++){
      let sx=-s*0.55+j*s*0.23+(i%2)*s*0.11;
      let sy=s*0.78-i*5;
      X.fillStyle=stoneC2[(i+j)%4];
      X.beginPath();X.roundRect(sx,sy,s*0.21,4,1);X.fill();
    }
  }

  // Kümüs gövdesi - kahverengi tahta
  let kümesColors=['#8B6914','#9B7924','#7B5904','#A08030','#8B7020'];
  for(let i=0;i<8;i++){
    X.fillStyle=kümesColors[i%kümesColors.length];
    X.fillRect(-s*0.55,s*0.12+i*s*0.085,s*1.1,s*0.085);
    X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
    X.beginPath();X.moveTo(-s*0.55,s*0.12+i*s*0.085);X.lineTo(s*0.55,s*0.12+i*s*0.085);X.stroke();
  }
  // Dikey destek ahşapları
  X.fillStyle='#5B4000';
  X.fillRect(-s*0.55,s*0.12,3,s*0.68);
  X.fillRect(s*0.52,s*0.12,3,s*0.68);
  X.fillRect(-s*0.01,s*0.12,2,s*0.68);

  // Çatı - saz/kamış çatı
  X.fillStyle='#654321';
  X.beginPath();X.moveTo(-s*0.65,s*0.12);X.lineTo(0,-s*0.28);X.lineTo(s*0.65,s*0.12);X.closePath();X.fill();
  // Çatı desen - saz katmanları
  for(let i=0;i<5;i++){
    let ry=s*0.12-i*s*0.075;
    let rw=s*(0.65-i*0.11);
    X.fillStyle=i%2?'#7B5510':'#5B4008';
    X.beginPath();X.moveTo(-rw,ry);X.lineTo(rw,ry);X.lineTo(rw-s*0.02,ry-s*0.07);X.lineTo(-rw+s*0.02,ry-s*0.07);X.closePath();X.fill();
    X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
    for(let j=-rw+s*0.05;j<rw;j+=s*0.09){
      X.beginPath();X.moveTo(j,ry);X.lineTo(j-s*0.01,ry-s*0.07);X.stroke();
    }
  }
  // Çatı kenar bordür
  X.strokeStyle='#4a3000';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.65,s*0.12);X.lineTo(0,-s*0.28);X.lineTo(s*0.65,s*0.12);X.stroke();
  // Çatı tepesi
  X.fillStyle='#5B4008';X.fillRect(-s*0.08,-s*0.3,s*0.16,s*0.04);

  // "KÜMES" tabelası - büyük ve okunaklı
  X.fillStyle='#d4a040';
  X.beginPath();X.roundRect(-s*0.24,s*0.0,s*0.48,s*0.13,3);X.fill();
  X.strokeStyle='#8d6e63';X.lineWidth=1.5;X.strokeRect(-s*0.24,s*0.0,s*0.48,s*0.13);
  X.fillStyle='#3a2010';X.font=`bold ${s*0.1}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.textBaseline='middle';
  X.fillText('KÜMES',0,s*0.065);
  X.textBaseline='alphabetic';

  // Yuvarlak tavuk kapısı - orta
  X.fillStyle='#3e2723';
  X.beginPath();X.arc(0,s*0.65,s*0.08,Math.PI,0);X.fill();
  X.fillStyle='#2d1b12';
  X.beginPath();X.arc(0,s*0.65,s*0.065,Math.PI,0);X.fill();
  // Kapı kenarı
  X.strokeStyle='#1a0f0a';X.lineWidth=1.5;
  X.beginPath();X.arc(0,s*0.65,s*0.08,Math.PI,0);X.stroke();

  // Pencere - sol taraf
  let pw=s*0.08,ph=s*0.07;
  X.fillStyle='#87CEEB';X.fillRect(-s*0.48,s*0.3,pw,ph);
  X.fillStyle='rgba(255,200,50,0.3)';X.fillRect(-s*0.48,s*0.3,pw,ph);
  X.strokeStyle='#4a3520';X.lineWidth=1;X.strokeRect(-s*0.48,s*0.3,pw,ph);
  X.beginPath();X.moveTo(-s*0.48+pw/2,s*0.3);X.lineTo(-s*0.48+pw/2,s*0.3+ph);X.stroke();
  X.beginPath();X.moveTo(-s*0.48,s*0.3+ph/2);X.lineTo(-s*0.48+pw,s*0.3+ph/2);X.stroke();

  // Pencere - sağ taraf
  X.fillStyle='#87CEEB';X.fillRect(s*0.40,s*0.3,pw,ph);
  X.fillStyle='rgba(255,200,50,0.3)';X.fillRect(s*0.40,s*0.3,pw,ph);
  X.strokeStyle='#4a3520';X.lineWidth=1;X.strokeRect(s*0.40,s*0.3,pw,ph);
  X.beginPath();X.moveTo(s*0.40+pw/2,s*0.3);X.lineTo(s*0.40+pw/2,s*0.3+ph);X.stroke();
  X.beginPath();X.moveTo(s*0.40,s*0.3+ph/2);X.lineTo(s*0.40+pw,s*0.3+ph/2);X.stroke();

  // Yumurta sepeti - sağ alt
  X.fillStyle='#a1887f';X.beginPath();X.ellipse(s*0.58,s*0.65,s*0.08,s*0.05,0,0,Math.PI*2);X.fill();
  X.fillStyle='#f5f5dc';X.beginPath();X.arc(s*0.56,s*0.63,s*0.02,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.6,s*0.63,s*0.02,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.58,s*0.61,s*0.02,0,Math.PI*2);X.fill();

  // Tünek çubuğu - sol yan
  X.fillStyle='#8d6e63';X.fillRect(-s*0.62,s*0.1,2,s*0.5);
  X.strokeStyle='#a1887f';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.65,s*0.2);X.lineTo(-s*0.55,s*0.2);X.stroke();

  // Seviye göstergesi ve çit
  let kLv=S.buildingLevel?S.buildingLevel.kümes||1:1;
  if(kLv>=2){
    X.fillStyle='rgba(0,0,0,0.4)';X.beginPath();X.roundRect(-s*0.12,-s*0.42,s*0.24,s*0.12,3);X.fill();
    X.fillStyle='#ffd54f';X.font=`bold ${s*0.07}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.fillText('Lv.'+kLv,0,-s*0.34);
  }
  let fW=s*(0.7+kLv*0.06),fH=s*(0.15+kLv*0.02);
  X.strokeStyle='#8B6508';X.lineWidth=1.5;
  X.strokeRect(-fW/2,s*0.82,fW,fH);
  X.fillStyle='#6B4500';
  for(let i=0;i<Math.min(kLv,5);i++){
    let fx=-fW/2+s*0.06+i*(fW-s*0.12)/Math.min(kLv,5);
    X.fillRect(fx,s*0.84,1.5,fH-s*0.03);
  }

  X.restore();
},

drawChicken(x,y,s,flip,colorIdx){
  X.save();X.translate(x,y);if(flip)X.scale(-1,1);
  let ci=colorIdx||0;
  let bodyColors=['#f5deb3','#8d6e63','#424242'];
  let bellyColors=['#deb887','#a1887f','#616161'];
  let headColors=['#f5deb3','#8d6e63','#424242'];
  let bc=bodyColors[ci],bl=bellyColors[ci],hc=headColors[ci];

  // Gölge
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(0,s*0.35,s*0.28,s*0.05,0,0,Math.PI*2);X.fill();
  // Bacaklar - daha ince
  X.fillStyle='#d4a017';X.fillRect(-s*0.06,s*0.15,1.5,s*0.2);X.fillRect(s*0.04,s*0.15,1.5,s*0.2);
  // Tırnaklar
  X.fillStyle='#d4a017';
  X.beginPath();X.moveTo(-s*0.07,s*0.35);X.lineTo(-s*0.1,s*0.37);X.stroke();
  X.beginPath();X.moveTo(s*0.05,s*0.35);X.lineTo(s*0.08,s*0.37);X.stroke();
  // Vücut
  X.fillStyle=bc;X.beginPath();X.ellipse(0,0,s*0.22,s*0.16,0,0,Math.PI*2);X.fill();
  // Kanat detayı
  X.fillStyle=bl;X.beginPath();X.ellipse(-s*0.03,-s*0.02,s*0.15,s*0.1,-.15,0,Math.PI*2);X.fill();
  // Tüy çizgileri
  X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
  X.beginPath();X.arc(-s*0.02,0,s*0.12,0.5,2.5);X.stroke();
  X.beginPath();X.arc(-s*0.05,s*0.02,s*0.08,0.8,2.2);X.stroke();
  // Kuyruk
  X.fillStyle=bc;X.beginPath();X.moveTo(-s*0.18,s*0.02);X.lineTo(-s*0.28,-s*0.08);X.lineTo(-s*0.22,-s*0.02);X.closePath();X.fill();
  // Baş
  X.fillStyle=hc;X.beginPath();X.arc(s*0.18,-s*0.08,s*0.1,0,Math.PI*2);X.fill();
  // Göz
  X.fillStyle='#fff';X.beginPath();X.arc(s*0.22,-s*0.1,s*0.04,0,Math.PI*2);X.fill();
  X.fillStyle='#000';X.beginPath();X.arc(s*0.23,-s*0.1,s*0.02,0,Math.PI*2);X.fill();
  // Gaga
  X.fillStyle='#ff8c00';
  X.beginPath();X.moveTo(s*0.28,-s*0.08);X.lineTo(s*0.35,-s*0.06);X.lineTo(s*0.28,-s*0.04);X.closePath();X.fill();
  // Comb
  X.fillStyle='#e53935';X.beginPath();X.arc(s*0.16,-s*0.16,s*0.04,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.2,-s*0.17,s*0.035,0,Math.PI*2);X.fill();
  // Wattle
  X.fillStyle='#e53935';X.beginPath();X.arc(s*0.25,-s*0.03,s*0.02,0,Math.PI*2);X.fill();
  X.restore();
},

drawCow(x,y,s,flip){
  X.save();X.translate(x,y);if(flip)X.scale(-1,1);
  // Gölge
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(0,s*0.42,s*0.42,s*0.07,0,0,Math.PI*2);X.fill();
  // Bacaklar
  X.fillStyle='#5d4037';X.fillRect(-s*0.22,s*0.2,2.5,s*0.22);X.fillRect(-s*0.1,s*0.22,2.5,s*0.2);
  X.fillRect(s*0.08,s*0.22,2.5,s*0.2);X.fillRect(s*0.18,s*0.2,2.5,s*0.22);
  // Kuyruk
  X.strokeStyle='#8d6e63';X.lineWidth=1.5;
  X.beginPath();X.moveTo(-s*0.28,s*0.02);X.quadraticCurveTo(-s*0.38,s*0.1,-s*0.35,s*0.18);X.stroke();
  X.fillStyle='#5d4037';X.beginPath();X.arc(-s*0.35,s*0.18,s*0.02,0,Math.PI*2);X.fill();
  // Vücut
  X.fillStyle='#f5f5dc';X.beginPath();X.ellipse(0,0,s*0.32,s*0.2,0,0,Math.PI*2);X.fill();
  // Lekeler
  X.fillStyle='#2d2d2d';
  X.beginPath();X.ellipse(-s*0.08,-s*0.04,s*0.1,s*0.07,.2,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(s*0.1,s*0.04,s*0.08,s*0.06,-.15,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(-s*0.02,s*0.08,s*0.06,s*0.04,.1,0,Math.PI*2);X.fill();
  // Memeler
  X.fillStyle='#ffb6c1';
  X.beginPath();X.ellipse(-s*0.08,s*0.16,s*0.04,s*0.035,0,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(s*0.04,s*0.16,s*0.04,s*0.035,0,0,Math.PI*2);X.fill();
  // Baş
  X.fillStyle='#f5f5dc';X.beginPath();X.ellipse(s*0.32,-s*0.06,s*0.1,s*0.09,0,0,Math.PI*2);X.fill();
  // Kulaklar
  X.fillStyle='#d7ccc8';
  X.beginPath();X.ellipse(s*0.35,-s*0.16,s*0.05,s*0.025,.4,0,Math.PI*2);X.fill();
  X.beginPath();X.ellipse(s*0.42,-s*0.13,s*0.05,s*0.025,-.3,0,Math.PI*2);X.fill();
  // Boynuzlar
  X.strokeStyle='#8d6e63';X.lineWidth=2;
  X.beginPath();X.moveTo(s*0.36,-s*0.14);X.quadraticCurveTo(s*0.38,-s*0.22,s*0.34,-s*0.24);X.stroke();
  X.beginPath();X.moveTo(s*0.42,-s*0.12);X.quadraticCurveTo(s*0.45,-s*0.2,s*0.42,-s*0.22);X.stroke();
  // Göz
  X.fillStyle='#000';X.beginPath();X.arc(s*0.36,-s*0.06,s*0.018,0,Math.PI*2);X.fill();
  // Bürün
  X.fillStyle='#ffb6c1';X.beginPath();X.ellipse(s*0.4,-s*0.01,s*0.04,s*0.03,0,0,Math.PI*2);X.fill();
  X.fillStyle='#000';X.beginPath();X.arc(s*0.39,-s*0.005,1.5,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.42,-s*0.005,1.5,0,Math.PI*2);X.fill();
  X.restore();
},

drawPineTree(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(2,s*0.6,s*0.3,s*0.06,0,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.04,s*0.15,s*0.08,s*0.45);
  // 4 katmanlı çam yaprakları
  X.fillStyle='#1b5e20';
  X.beginPath();X.moveTo(0,-s*0.5);X.lineTo(-s*0.35,s*0.15);X.lineTo(s*0.35,s*0.15);X.closePath();X.fill();
  X.fillStyle='#2e7d32';
  X.beginPath();X.moveTo(0,-s*0.42);X.lineTo(-s*0.3,s*0.0);X.lineTo(s*0.3,s*0.0);X.closePath();X.fill();
  X.fillStyle='#388e3c';
  X.beginPath();X.moveTo(0,-s*0.32);X.lineTo(-s*0.22,s*0.08);X.lineTo(s*0.22,s*0.08);X.closePath();X.fill();
  X.fillStyle='#43a047';
  X.beginPath();X.moveTo(0,-s*0.22);X.lineTo(-s*0.15,s*0.02);X.lineTo(s*0.15,s*0.02);X.closePath();X.fill();
  X.restore();
},

drawDeciduousTree(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(2,s*0.6,s*0.35,s*0.06,0,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.05,s*0.1,s*0.1,s*0.5);
  X.fillStyle='#4e342e';X.fillRect(-s*0.12,s*0.2,s*0.1,s*0.04);
  // Sonbahar renkli yapraklar
  let autumnColors=['#e65100','#bf360c','#f9a825','#ff8f00','#e65100','#d84315'];
  X.fillStyle='#e65100';X.beginPath();X.arc(0,-s*0.15,s*0.32,0,Math.PI*2);X.fill();
  X.fillStyle='#bf360c';X.beginPath();X.arc(-s*0.1,-s*0.22,s*0.2,0,Math.PI*2);X.fill();
  X.fillStyle='#f9a825';X.beginPath();X.arc(s*0.12,-s*0.1,s*0.18,0,Math.PI*2);X.fill();
  X.fillStyle='#ff8f00';X.beginPath();X.arc(-s*0.04,-s*0.28,s*0.12,0,Math.PI*2);X.fill();
  X.fillStyle='#d84315';X.beginPath();X.arc(s*0.08,-s*0.25,s*0.1,0,Math.PI*2);X.fill();
  // Düşen yapraklar
  for(let i=0;i<3;i++){
    let lx=Math.sin(Date.now()/3000+i*2)*s*0.3+Math.cos(Date.now()/2500+i)*s*0.1;
    let ly=s*0.1+i*s*0.12+Math.sin(Date.now()/2000+i*3)*s*0.05;
    X.fillStyle=autumnColors[i];
    X.beginPath();X.ellipse(lx,ly,s*0.03,s*0.02,Date.now()/1000+i,0,Math.PI*2);X.fill();
  }
  X.restore();
},

drawShrub(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#2e7d32';X.beginPath();X.arc(0,0,s,0,Math.PI*2);X.fill();
  X.fillStyle='#388e3c';X.beginPath();X.arc(-s*0.3,-s*0.15,s*0.7,0,Math.PI*2);X.fill();
  X.fillStyle='#43a047';X.beginPath();X.arc(s*0.25,-s*0.2,s*0.6,0,Math.PI*2);X.fill();
  X.fillStyle='#4caf50';X.beginPath();X.arc(0,-s*0.35,s*0.45,0,Math.PI*2);X.fill();
  // Mevsime göre berry/çiçek
  let sc=S.sea;
  if(sc===1){for(let i=0;i<4;i++){X.fillStyle='#e53935';X.beginPath();X.arc(Math.cos(i*1.5)*s*0.4,-s*0.1+Math.sin(i*1.5)*s*0.3,s*0.05,0,Math.PI*2);X.fill()}}
  else if(sc===2){for(let i=0;i<3;i++){X.fillStyle='#ff9800';X.beginPath();X.arc(Math.cos(i*2)*s*0.35,-s*0.15+Math.sin(i*2)*s*0.25,s*0.04,0,Math.PI*2);X.fill()}}
  X.restore();
},

drawDeadTree(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(2,s*0.55,s*0.25,s*0.05,0,0,Math.PI*2);X.fill();
  X.fillStyle='#6d4c41';X.fillRect(-s*0.04,s*0.1,s*0.08,s*0.45);
  // Kalın dallar - yapraksız
  X.strokeStyle='#6d4c41';X.lineWidth=3;
  X.beginPath();X.moveTo(0,s*0.15);X.lineTo(-s*0.2,-s*0.1);X.stroke();
  X.beginPath();X.moveTo(0,s*0.1);X.lineTo(s*0.25,-s*0.05);X.stroke();
  X.beginPath();X.moveTo(-s*0.15,-s*0.05);X.lineTo(-s*0.25,-s*0.2);X.stroke();
  X.beginPath();X.moveTo(s*0.2,-s*0.02);X.lineTo(s*0.15,-s*0.2);X.stroke();
  X.lineWidth=1.5;
  X.beginPath();X.moveTo(-s*0.2,-s*0.1);X.lineTo(-s*0.15,-s*0.25);X.stroke();
  X.beginPath();X.moveTo(s*0.25,-s*0.05);X.lineTo(s*0.3,-s*0.18);X.stroke();
  X.restore();
},

drawSheep(x,y,s,flip){
  X.save();X.translate(x,y);if(flip)X.scale(-1,1);
  // Gölge
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(0,s*0.38,s*0.35,s*0.06,0,0,Math.PI*2);X.fill();
  // Bacaklar
  X.fillStyle='#2d2d2d';X.fillRect(-s*0.15,s*0.18,2,s*0.2);X.fillRect(s*0.1,s*0.18,2,s*0.2);
  // Yün kütle
  X.fillStyle='#f5f5f0';
  X.beginPath();X.arc(-s*0.1,0,s*0.18,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.05,-s*0.03,s*0.16,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(0,s*0.08,s*0.14,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(-s*0.05,-s*0.1,s*0.13,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.1,s*0.06,s*0.12,0,Math.PI*2);X.fill();
  X.fillStyle='#e8e8e0';
  X.beginPath();X.arc(0,-s*0.06,s*0.11,0,Math.PI*2);X.fill();
  // Baş - siyah, yünden dışarı
  X.fillStyle='#2d2d2d';X.beginPath();X.ellipse(s*0.25,-s*0.04,s*0.08,s*0.07,0,0,Math.PI*2);X.fill();
  // Göz
  X.fillStyle='#fff';X.beginPath();X.arc(s*0.28,-s*0.05,s*0.025,0,Math.PI*2);X.fill();
  X.fillStyle='#000';X.beginPath();X.arc(s*0.29,-s*0.05,s*0.012,0,Math.PI*2);X.fill();
  // Kulak
  X.fillStyle='#2d2d2d';X.beginPath();X.ellipse(s*0.22,-s*0.1,s*0.04,s*0.02,.5,0,Math.PI*2);X.fill();
  X.restore();
},

drawAppleTree(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(2,s*0.6,s*0.35,s*0.08,0,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.05,s*0.1,s*0.1,s*0.5);
  X.fillStyle='#4e342e';X.fillRect(-s*0.15,s*0.2,s*0.12,s*0.04);
  X.fillStyle='#1b5e20';X.beginPath();X.arc(0,-s*0.15,s*0.35,0,Math.PI*2);X.fill();
  X.fillStyle='#2e7d32';X.beginPath();X.arc(-s*0.1,-s*0.22,s*0.22,0,Math.PI*2);X.fill();
  X.fillStyle='#388e3c';X.beginPath();X.arc(s*0.12,-s*0.1,s*0.18,0,Math.PI*2);X.fill();
  X.fillStyle='#43a047';X.beginPath();X.arc(-s*0.04,-s*0.28,s*0.12,0,Math.PI*2);X.fill();
  let fruits=[[s*0.15,-s*0.18,'#e53935'],[-s*0.18,-s*0.1,'#e53935'],[s*0.05,-s*0.3,'#c62828'],[-s*0.08,-s*0.25,'#e53935']];
  fruits.forEach(f=>{X.fillStyle=f[2];X.beginPath();X.arc(f[0],f[1],s*0.04,0,Math.PI*2);X.fill();
    X.fillStyle='rgba(255,255,255,0.3)';X.beginPath();X.arc(f[0]-1,f[1]-1,s*0.015,0,Math.PI*2);X.fill()});
  X.restore();
},

drawCropSprite(x,y,s,type,g,cr){
  X.save();X.translate(x,y);
  if(type==='DOMATES'){
    X.fillStyle='#558b2f';X.fillRect(-1,0,2,s*0.3);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(-3,s*0.05,3,1.5,-.3,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(3,s*0.08,3,1.5,.3,0,Math.PI*2);X.fill();
    if(g>0.3){let n=Math.floor(g*4)+1;
      for(let i=0;i<n;i++){let mx=Math.cos(i*2)*s*0.15;let my=-s*0.05+Math.sin(i*1.7)*s*0.1;
        X.fillStyle=cr.col[i%2];X.beginPath();X.arc(mx,my,s*0.06,0,Math.PI*2);X.fill();
        X.fillStyle='rgba(255,255,255,0.3)';X.beginPath();X.arc(mx-1,my-1,1.5,0,Math.PI*2);X.fill()}}
  }else if(type==='PATATES'){
    X.fillStyle='#795548';X.beginPath();X.ellipse(0,s*0.1,s*0.25,s*0.12,0,0,Math.PI*2);X.fill();
    X.fillStyle='#4caf50';X.beginPath();X.ellipse(-2,-s*0.08,2.5,4,-.15,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(2,-s*0.06,2.5,4,.15,0,Math.PI*2);X.fill();
    if(g>0.3){let n=Math.floor(g*3)+1;
      for(let i=0;i<n;i++){let px=Math.cos(i*2)*s*0.12;let py=s*0.1+Math.sin(i*1.5)*s*0.05;
        X.fillStyle=cr.col[i%2];X.beginPath();X.ellipse(px,py,s*0.07,s*0.05,0,0,Math.PI*2);X.fill()}}
  }else if(type==='SALATALIK'){
    X.fillStyle='#558b2f';X.fillRect(-1,-s*0.05,2,s*0.3);
    X.fillStyle='#43a047';
    X.beginPath();X.ellipse(-4,s*0.02,4,2,-.25,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(4,s*0.04,4,2,.25,0,Math.PI*2);X.fill();
    if(g>0.4){let sh=s*0.12+g*s*0.08;
      X.fillStyle='#2e7d32';X.beginPath();X.ellipse(s*0.1,-s*0.1,s*0.05,sh,0.3,0,Math.PI*2);X.fill();
      X.fillStyle='#43a047';X.beginPath();X.ellipse(s*0.08,-s*0.12,s*0.03,sh*0.6,0.3,0,Math.PI*2);X.fill()}
  }else if(type==='MARUL'){
    let l=Math.floor(g*3)+1;
    for(let i=l;i>=0;i--){
      let lr=s*0.08+i*s*0.04;
      X.fillStyle=i%2?cr.col[0]:cr.col[1];
      X.beginPath();X.ellipse(0,-i*s*0.04,lr,lr*0.5,0,0,Math.PI*2);X.fill();
    }
  }else if(type==='BIBER'){
    X.fillStyle='#558b2f';X.fillRect(-1,0,2,s*0.3);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(-2,s*0.05,2.5,1.5,-.2,0,Math.PI*2);X.fill();
    if(g>0.3){let n=Math.floor(g*3)+1;
      for(let i=0;i<n;i++){let mx=Math.cos(i*2.1)*s*0.12;let my=-s*0.02+Math.sin(i*1.8)*s*0.08;
        X.fillStyle=cr.col[i%2];X.beginPath();X.ellipse(mx,my,s*0.04,s*0.06,0.2*i,0,Math.PI*2);X.fill()}}
  }else if(type==='PATLICAN'){
    X.fillStyle='#558b2f';X.fillRect(-1,0,2,s*0.28);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(-2,s*0.03,2,1.2,-.2,0,Math.PI*2);X.fill();
    if(g>0.3){let n=Math.floor(g*3)+1;
      for(let i=0;i<n;i++){let mx=Math.cos(i*2)*s*0.13;let my=-s*0.03+Math.sin(i*1.5)*s*0.08;
        X.fillStyle=cr.col[i%2];X.beginPath();X.ellipse(mx,my,s*0.05,s*0.08,0.1*i,0,Math.PI*2);X.fill()}}
  }else if(type==='MISIR'){
    X.fillStyle='#558b2f';X.fillRect(-1,0,2,s*0.35);
    if(g>0.3){X.fillStyle='#f9a825';X.beginPath();X.ellipse(0,-s*0.08,s*0.05,s*0.12,0,0,Math.PI*2);X.fill();
      X.fillStyle='#fdd835';for(let i=0;i<3;i++){X.beginPath();X.arc(-2+i*2,-s*0.1,1.5,0,Math.PI*2);X.fill()}}
  }else if(type==='KABAK'){
    X.fillStyle='#558b2f';X.fillRect(-1,0,2,s*0.25);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(0,s*0.05,3,1.5,0,0,Math.PI*2);X.fill();
    if(g>0.3){X.fillStyle=cr.col[0];X.beginPath();X.ellipse(0,s*0.1,s*0.12,s*0.08,0,0,Math.PI*2);X.fill();
      X.fillStyle=cr.col[1];X.beginPath();X.ellipse(0,s*0.09,s*0.08,s*0.05,0,0,Math.PI*2);X.fill()}
  }else if(type==='SOGAN'){
    X.fillStyle='#4caf50';X.beginPath();X.ellipse(-2,-s*0.1,1.5,4,-.15,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(2,-s*0.08,1.5,4,.15,0,Math.PI*2);X.fill();
    if(g>0.3){X.fillStyle=cr.col[0];X.beginPath();X.ellipse(0,s*0.08,s*0.08,s*0.06,0,0,Math.PI*2);X.fill()}
  }else if(type==='BUGDAY'){
    X.fillStyle='#8d6e63';X.fillRect(-0.5,0,1,s*0.35);
    if(g>0.2){X.fillStyle='#d4a017';X.beginPath();X.ellipse(0,-s*0.1,1.5,s*0.1,0,0,Math.PI*2);X.fill()}
    if(g>0.5){X.fillStyle='#c68f00';
      for(let i=-1;i<=1;i++){X.beginPath();X.ellipse(i*2.5,-s*0.12,1,s*0.06,0.2*i,0,Math.PI*2);X.fill()}}
  }
  X.restore();
},

drawHarvestProduct(x,y,s,type,cr){
  X.save();X.translate(x,y);
  if(type==='DOMATES'){
    X.fillStyle='#c62828';X.beginPath();X.arc(0,0,s*0.38,0,Math.PI*2);X.fill();
    X.fillStyle='#e53935';X.beginPath();X.arc(-s*0.05,-s*0.05,s*0.28,0,Math.PI*2);X.fill();
    X.fillStyle='#ef5350';X.beginPath();X.arc(-s*0.08,-s*0.08,s*0.15,0,Math.PI*2);X.fill();
    X.fillStyle='rgba(255,255,255,0.25)';X.beginPath();X.arc(-s*0.12,-s*0.14,s*0.08,0,Math.PI*2);X.fill();
    X.fillStyle='#558b2f';X.fillRect(-s*0.03,-s*0.42,s*0.06,s*0.12);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(-s*0.06,-s*0.38,s*0.08,s*0.03,-.4,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(s*0.06,-s*0.36,s*0.07,s*0.03,.4,0,Math.PI*2);X.fill();
  }else if(type==='PATATES'){
    X.fillStyle='#8d6e63';X.beginPath();X.ellipse(0,0,s*0.35,s*0.22,0,0,Math.PI*2);X.fill();
    X.fillStyle='#795548';X.beginPath();X.ellipse(-s*0.05,-s*0.03,s*0.25,s*0.16,0,0,Math.PI*2);X.fill();
    X.fillStyle='#a1887f';X.beginPath();X.arc(-s*0.08,-s*0.06,s*0.04,0,Math.PI*2);X.fill();
    X.beginPath();X.arc(s*0.1,s*0.04,s*0.03,0,Math.PI*2);X.fill();
    X.beginPath();X.arc(-s*0.15,s*0.06,s*0.025,0,Math.PI*2);X.fill();
  }else if(type==='SALATALIK'){
    X.fillStyle='#2e7d32';X.beginPath();X.ellipse(0,0,s*0.15,s*0.38,0.1,0,Math.PI*2);X.fill();
    X.fillStyle='#388e3c';X.beginPath();X.ellipse(-s*0.02,-s*0.02,s*0.1,s*0.3,0.1,0,Math.PI*2);X.fill();
    X.fillStyle='#43a047';
    for(let i=0;i<5;i++){X.beginPath();X.ellipse(0,-s*0.25+i*s*0.12,s*0.12+Math.sin(i)*s*0.02,s*0.04,0,0,Math.PI*2);X.fill()}
    X.fillStyle='#558b2f';X.fillRect(-s*0.02,-s*0.42,s*0.04,s*0.08);
  }else if(type==='MARUL'){
    let cols=['#558b2f','#7cb342','#8bc34a','#689f38'];
    for(let i=4;i>=0;i--){
      X.fillStyle=cols[i%cols.length];
      X.beginPath();X.ellipse(0,-i*s*0.04,s*0.3-i*s*0.04,s*0.15-i*s*0.02,0,0,Math.PI*2);X.fill();
    }
    X.fillStyle='#33691e';X.beginPath();X.ellipse(0,s*0.08,s*0.06,s*0.1,0,0,Math.PI*2);X.fill();
  }else if(type==='BIBER'){
    X.fillStyle='#c62828';X.beginPath();X.ellipse(0,s*0.02,s*0.12,s*0.3,0.05,0,Math.PI*2);X.fill();
    X.fillStyle='#e53935';X.beginPath();X.ellipse(-s*0.02,0,s*0.08,s*0.22,0.05,0,Math.PI*2);X.fill();
    X.fillStyle='rgba(255,255,255,0.2)';X.beginPath();X.ellipse(-s*0.06,-s*0.08,s*0.03,s*0.1,0.1,0,Math.PI*2);X.fill();
    X.fillStyle='#558b2f';X.fillRect(-s*0.02,-s*0.32,s*0.04,s*0.1);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(0,-s*0.32,s*0.06,s*0.03,0,0,Math.PI*2);X.fill();
  }else if(type==='PATLICAN'){
    X.fillStyle='#4a148c';X.beginPath();X.ellipse(0,s*0.02,s*0.14,s*0.32,0.05,0,Math.PI*2);X.fill();
    X.fillStyle='#6a1b9a';X.beginPath();X.ellipse(-s*0.02,0,s*0.1,s*0.24,0.05,0,Math.PI*2);X.fill();
    X.fillStyle='rgba(255,255,255,0.15)';X.beginPath();X.ellipse(-s*0.05,-s*0.1,s*0.03,s*0.12,0.1,0,Math.PI*2);X.fill();
    X.fillStyle='#558b2f';X.fillRect(-s*0.02,-s*0.35,s*0.04,s*0.08);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(0,-s*0.35,s*0.07,s*0.03,0,0,Math.PI*2);X.fill();
  }else if(type==='MISIR'){
    X.fillStyle='#f9a825';X.beginPath();X.ellipse(0,0,s*0.14,s*0.35,0,0,Math.PI*2);X.fill();
    X.fillStyle='#fdd835';X.beginPath();X.ellipse(-s*0.02,-s*0.02,s*0.1,s*0.27,0,0,Math.PI*2);X.fill();
    X.fillStyle='#fbc02d';
    for(let r=0;r<6;r++)for(let c=0;c<3;c++){
      X.beginPath();X.arc(-s*0.06+c*s*0.06,-s*0.2+r*s*0.08,s*0.025,0,Math.PI*2);X.fill()}
    X.fillStyle='#8d6e63';X.fillRect(-s*0.015,-s*0.42,s*0.03,s*0.1);
    X.fillStyle='#a5d6a7';X.beginPath();X.ellipse(-s*0.06,-s*0.38,s*0.06,s*0.08,-.5,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(s*0.06,-s*0.36,s*0.05,s*0.07,.5,0,Math.PI*2);X.fill();
  }else if(type==='KABAK'){
    X.fillStyle='#e65100';X.beginPath();X.ellipse(0,s*0.02,s*0.28,s*0.2,0,0,Math.PI*2);X.fill();
    X.fillStyle='#ff9800';X.beginPath();X.ellipse(-s*0.03,0,s*0.2,s*0.14,0,0,Math.PI*2);X.fill();
    X.fillStyle='rgba(255,255,255,0.15)';X.beginPath();X.ellipse(-s*0.08,-s*0.06,s*0.08,s*0.06,0,0,Math.PI*2);X.fill();
    X.fillStyle='#558b2f';X.fillRect(-s*0.02,-s*0.22,s*0.04,s*0.08);
    X.fillStyle='#43a047';X.beginPath();X.ellipse(0,-s*0.22,s*0.05,s*0.03,0,0,Math.PI*2);X.fill();
  }else if(type==='SOGAN'){
    X.fillStyle='#8d6e63';X.beginPath();X.arc(0,s*0.05,s*0.22,0,Math.PI*2);X.fill();
    X.fillStyle='#a1887f';X.beginPath();X.arc(-s*0.03,0,s*0.16,0,Math.PI*2);X.fill();
    X.fillStyle='#bcaaa4';X.beginPath();X.arc(-s*0.06,-s*0.04,s*0.08,0,Math.PI*2);X.fill();
    X.fillStyle='#4caf50';X.fillRect(-s*0.02,-s*0.3,s*0.04,s*0.15);
    X.fillStyle='#66bb6a';X.beginPath();X.ellipse(-s*0.04,-s*0.32,s*0.04,s*0.06,-.3,0,Math.PI*2);X.fill();
    X.beginPath();X.ellipse(s*0.04,-s*0.3,s*0.03,s*0.05,.3,0,Math.PI*2);X.fill();
  }else if(type==='BUGDAY'){
    X.fillStyle='#8d6e63';X.fillRect(-s*0.015,-s*0.1,s*0.03,s*0.45);
    X.fillStyle='#d4a017';X.beginPath();X.ellipse(0,-s*0.2,s*0.06,s*0.15,0,0,Math.PI*2);X.fill();
    X.fillStyle='#c68f00';
    for(let i=-2;i<=2;i++){
      X.beginPath();X.ellipse(i*s*0.035,-s*0.22,s*0.025,s*0.08,0.15*i,0,Math.PI*2);X.fill()}
    X.fillStyle='#b8860b';
    for(let i=-1;i<=1;i++){
      X.beginPath();X.ellipse(i*s*0.04,-s*0.32,s*0.02,s*0.05,0.2*i,0,Math.PI*2);X.fill()}
  }
  X.restore();
},

drawTreeSprite(x,y,s,g,cr){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(2,s*0.5,s*0.3,s*0.06,0,0,Math.PI*2);X.fill();
  if(g<0.15){
    X.strokeStyle='#5d4037';X.lineWidth=1.5;X.beginPath();X.moveTo(0,s*0.2);X.lineTo(0,-s*0.05);X.stroke();
    X.fillStyle='#81c784';X.beginPath();X.arc(0,-s*0.08,s*0.1,0,Math.PI*2);X.fill();
  }else if(g<0.5){
    X.fillStyle='#6d4c41';X.fillRect(-1.5,s*0.05,3,s*0.3);
    X.fillStyle='#388e3c';X.beginPath();X.arc(0,-s*0.1,s*0.22,0,Math.PI*2);X.fill();
    X.fillStyle='#43a047';X.beginPath();X.arc(s*0.06,-s*0.16,s*0.13,0,Math.PI*2);X.fill();
  }else{
    X.fillStyle='#5d4037';X.fillRect(-2,s*0.05,4,s*0.4);
    X.fillStyle='#1b5e20';X.beginPath();X.arc(0,-s*0.15,s*0.32,0,Math.PI*2);X.fill();
    X.fillStyle='#2e7d32';X.beginPath();X.arc(-s*0.1,-s*0.22,s*0.2,0,Math.PI*2);X.fill();
    X.fillStyle='#388e3c';X.beginPath();X.arc(s*0.12,-s*0.12,s*0.15,0,Math.PI*2);X.fill();
    X.fillStyle='#43a047';X.beginPath();X.arc(-s*0.03,-s*0.26,s*0.1,0,Math.PI*2);X.fill();
    let fc=Math.floor(g*5)+2;
    for(let i=0;i<fc;i++){
      let angle=i*1.2+x*0.1;
      let fx=Math.cos(angle)*s*0.22;
      let fy=-s*0.18+Math.sin(angle)*s*0.15;
      X.fillStyle=cr.col[i%2];X.beginPath();X.arc(fx,fy,s*0.04,0,Math.PI*2);X.fill();
      X.fillStyle='rgba(255,255,255,0.3)';X.beginPath();X.arc(fx-0.5,fy-0.5,1,0,Math.PI*2);X.fill();
    }
  }
  X.restore();
},

drawRock(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#78909c';X.beginPath();X.ellipse(0,0,s,s*0.6,0,0,Math.PI*2);X.fill();
  X.fillStyle='#90a4ae';X.beginPath();X.ellipse(-s*0.15,-s*0.1,s*0.5,s*0.3,-.2,0,Math.PI*2);X.fill();
  X.fillStyle='rgba(255,255,255,0.15)';X.beginPath();X.ellipse(-s*0.2,-s*0.2,s*0.25,s*0.15,-.3,0,Math.PI*2);X.fill();
  X.restore();
},

drawBush(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#2e7d32';X.beginPath();X.arc(0,0,s,0,Math.PI*2);X.fill();
  X.fillStyle='#388e3c';X.beginPath();X.arc(-s*0.4,-s*0.1,s*0.6,0,Math.PI*2);X.fill();
  X.fillStyle='#43a047';X.beginPath();X.arc(s*0.3,-s*0.15,s*0.55,0,Math.PI*2);X.fill();
  X.fillStyle='#4caf50';X.beginPath();X.arc(0,-s*0.3,s*0.4,0,Math.PI*2);X.fill();
  X.restore();
},

drawHayBale(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#c8a84e';X.fillRect(-s*0.4,-s*0.3,s*0.8,s*0.6);
  X.fillStyle='#d4b85e';X.fillRect(-s*0.35,-s*0.25,s*0.7,s*0.2);
  X.fillStyle='#b8983e';X.fillRect(-s*0.35,s*0,s*0.7,s*0.2);
  X.fillStyle='#a8882e';X.fillRect(-s*0.4,-s*0.32,s*0.8,s*0.05);
  X.fillRect(-s*0.4,s*0.27,s*0.8,s*0.05);
  X.restore();
},

drawWindmill(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(0,s*0.6,s*0.45,s*0.08,0,0,Math.PI*2);X.fill();
  // Gövde - beyaz taş
  X.fillStyle='#e8e0d0';
  X.beginPath();X.moveTo(-s*0.25,s*0.55);X.lineTo(-s*0.18,-s*0.3);X.lineTo(s*0.18,-s*0.3);X.lineTo(s*0.25,s*0.55);X.closePath();X.fill();
  // Taş doku
  for(let i=0;i<6;i++){
    for(let j=0;j<3;j++){
      let tx=-s*0.22+j*s*0.15+(i%2)*s*0.07;
      let ty=s*0.5-i*s*0.13;
      X.strokeStyle='rgba(0,0,0,0.08)';X.lineWidth=0.5;
      X.beginPath();X.roundRect(tx,ty,s*0.13,s*0.12,1);X.stroke();
    }
  }
  // Çatı
  X.fillStyle='#8d6e63';
  X.beginPath();X.moveTo(-s*0.22,-s*0.3);X.lineTo(0,-s*0.45);X.lineTo(s*0.22,-s*0.3);X.closePath();X.fill();
  // Kapı
  X.fillStyle='#5d4037';X.beginPath();X.arc(0,s*0.45,s*0.08,Math.PI,0);X.fill();
  // Pencere
  X.fillStyle='#87CEEB';X.beginPath();X.arc(0,s*0.1,s*0.06,0,Math.PI*2);X.fill();
  X.strokeStyle='#5d4037';X.lineWidth=1;X.beginPath();X.arc(0,s*0.1,s*0.06,0,Math.PI*2);X.stroke();
  // Kanatlar - akicilikli animasyon (ruzgar hizina gore)
  X.save();X.translate(0,-s*0.15);X.rotate(windmillAngle);
  X.fillStyle='#d7ccc8';
  X.fillRect(-2,-s*0.35,4,s*0.35);X.fillRect(-2,0,4,s*0.35);
  X.fillRect(-s*0.35,-2,s*0.35,4);X.fillRect(0,-2,s*0.35,4);
  // Kanat kirisleri
  X.fillStyle='rgba(0,0,0,0.08)';
  X.fillRect(-1.5,-s*0.33,3,s*0.31);X.fillRect(-1.5,2,3,s*0.31);
  X.fillRect(-s*0.33,-1.5,s*0.31,3);X.fillRect(2,-1.5,s*0.31,3);
  X.restore();
  // Merkez
  X.fillStyle='#5d4037';X.beginPath();X.arc(0,-s*0.15,s*0.04,0,Math.PI*2);X.fill();
  // Seviye göstergesi
  let wLv=S.buildingLevel?S.buildingLevel.degirmen||1:1;
  if(wLv>=2){
    X.fillStyle='rgba(0,0,0,0.4)';X.beginPath();X.roundRect(-s*0.1,-s*0.55,s*0.2,s*0.1,3);X.fill();
    X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.fillText('Lv.'+wLv,0,-s*0.48);
  }
  X.restore();
},

drawGreenhouse(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(0,s*0.45,s*0.55,s*0.07,0,0,Math.PI*2);X.fill();
  // Cam çerçeve
  X.strokeStyle='#90a4ae';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.4,s*0.4);X.lineTo(-s*0.4,-s*0.15);X.lineTo(0,-s*0.35);X.lineTo(s*0.4,-s*0.15);X.lineTo(s*0.4,s*0.4);X.closePath();X.stroke();
  // Cam paneller - yarı saydam
  X.fillStyle='rgba(200,230,255,0.3)';X.beginPath();
  X.moveTo(-s*0.38,s*0.38);X.lineTo(-s*0.38,-s*0.13);X.lineTo(0,-s*0.33);X.lineTo(s*0.38,-s*0.13);X.lineTo(s*0.38,s*0.38);X.closePath();X.fill();
  // Dikey cam çubukları
  X.strokeStyle='rgba(144,164,174,0.6)';X.lineWidth=1;
  X.beginPath();X.moveTo(-s*0.2,s*0.38);X.lineTo(-s*0.2,-s*0.18);X.stroke();
  X.beginPath();X.moveTo(s*0.2,s*0.38);X.lineTo(s*0.2,-s*0.18);X.stroke();
  X.beginPath();X.moveTo(0,s*0.38);X.lineTo(0,-s*0.33);X.stroke();
  // İçeride yeşil bitkiler
  X.fillStyle='rgba(76,175,80,0.4)';X.fillRect(-s*0.3,s*0.2,s*0.2,s*0.15);
  X.fillStyle='rgba(129,199,132,0.4)';X.fillRect(s*0.05,s*0.18,s*0.25,s*0.18);
  X.fillStyle='rgba(56,142,60,0.3)';X.fillRect(-s*0.15,s*0.05,s*0.15,s*0.12);
  // Kapı
  X.fillStyle='#90a4ae';X.fillRect(-s*0.06,s*0.25,s*0.12,s*0.15);
  X.restore();
},

drawHayBarn(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(0,s*0.5,s*0.5,s*0.07,0,0,Math.PI*2);X.fill();
  // Taş temel
  X.fillStyle='#9e9e9e';X.fillRect(-s*0.4,s*0.35,s*0.8,s*0.1);
  // Tahta gövde
  for(let i=0;i<4;i++){
    X.fillStyle=i%2?'#a08930':'#8B7514';
    X.fillRect(-s*0.4,s*0.05+i*s*0.08,s*0.8,s*0.08);
  }
  // Çatı - saman
  X.fillStyle='#c8a84e';
  X.beginPath();X.moveTo(-s*0.5,s*0.05);X.lineTo(0,-s*0.25);X.lineTo(s*0.5,s*0.05);X.closePath();X.fill();
  X.fillStyle='#d4b85e';
  X.beginPath();X.moveTo(-s*0.45,s*0.05);X.lineTo(0,-s*0.2);X.lineTo(s*0.45,s*0.05);X.closePath();X.fill();
  // Saman yığını kapıda
  X.fillStyle='#c8a84e';X.fillRect(-s*0.15,s*0.2,s*0.3,s*0.15);
  X.fillStyle='#d4b85e';
  for(let i=0;i<3;i++){X.fillRect(-s*0.12+i*s*0.1,s*0.22,s*0.08,s*0.04)}
  X.restore();
},

drawTractorShed(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(0,s*0.45,s*0.5,s*0.06,0,0,Math.PI*2);X.fill();
  // Metal gövde
  X.fillStyle='#78909c';X.fillRect(-s*0.4,s*0.05,s*0.8,s*0.35);
  X.fillStyle='#90a4ae';X.fillRect(-s*0.38,s*0.08,s*0.76,s*0.02);
  // Çatı
  X.fillStyle='#607d8b';
  X.beginPath();X.moveTo(-s*0.45,s*0.05);X.lineTo(-s*0.42,-s*0.15);X.lineTo(s*0.42,-s*0.15);X.lineTo(s*0.45,s*0.05);X.closePath();X.fill();
  // Açık garaj kapısı
  X.fillStyle='#455a64';
  X.beginPath();X.moveTo(-s*0.3,s*0.4);X.lineTo(-s*0.3,s*0.1);X.lineTo(s*0.3,s*0.1);X.lineTo(s*0.3,s*0.4);X.closePath();X.fill();
  // İçerisi karanlık
  X.fillStyle='rgba(0,0,0,0.3)';X.fillRect(-s*0.28,s*0.12,s*0.56,s*0.26);
  // Traktör silueti içeride
  X.fillStyle='#c62828';X.fillRect(-s*0.18,s*0.2,s*0.2,s*0.1);
  X.fillStyle='#333';X.beginPath();X.arc(-s*0.12,s*0.32,s*0.05,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0,s*0.32,s*0.035,0,Math.PI*2);X.fill();
  X.restore();
},

drawFırın(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.12)';X.beginPath();X.ellipse(0,s*0.55,s*0.4,s*0.07,0,0,Math.PI*2);X.fill();
  X.fillStyle='#d84315';X.fillRect(-s*0.35,s*0.05,s*0.7,s*0.5);
  X.fillStyle='#bf360c';X.beginPath();X.moveTo(-s*0.4,s*0.05);X.lineTo(0,-s*0.25);X.lineTo(s*0.4,s*0.05);X.closePath();X.fill();
  X.fillStyle='#3e2723';X.fillRect(-s*0.15,s*0.15,s*0.3,s*0.4);
  X.fillStyle='#ff6f00';X.beginPath();X.arc(0,s*0.35,s*0.08,0,Math.PI*2);X.fill();
  X.fillStyle='#ffab00';X.beginPath();X.arc(0,s*0.35,s*0.04,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.06,-s*0.15,s*0.12,s*0.2);
  X.fillStyle='#424242';X.fillRect(s*0.1,s*0.0,s*0.12,s*0.08);
  let fLv=S.buildingLevel?S.buildingLevel.fırın||1:1;
  if(fLv>=2){
    X.fillStyle='rgba(0,0,0,0.4)';X.beginPath();X.roundRect(-s*0.1,-s*0.38,s*0.2,s*0.1,3);X.fill();
    X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.fillText('Lv.'+fLv,0,-s*0.31);
  }
  X.restore();
},

drawSutIslem(x,y,s){
  X.save();X.translate(x,y);
  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.58,s*0.48,s*0.08,0,0,Math.PI*2);X.fill();
  // Temel - gri beton
  let stoneC=['#9e9e9e','#b0b0b0','#a0a0a0','#c0c0c0'];
  for(let i=0;i<4;i++){for(let j=0;j<6;j++){X.fillStyle=stoneC[(i+j)%4];X.beginPath();X.roundRect(-s*0.42+j*s*0.14,s*0.48-i*4,s*0.12,3.5,1);X.fill()}}
  // Ana bina - beyaz/çelik panel
  X.fillStyle='#e0e0e0';X.fillRect(-s*0.38,s*0.0,s*0.76,s*0.48);
  X.fillStyle='#d0d0d0';X.fillRect(-s*0.38,s*0.0,s*0.76,s*0.03);
  // Çelik paneller - dikey çizgiler
  X.strokeStyle='#ccc';X.lineWidth=0.5;
  for(let i=0;i<7;i++){X.beginPath();X.moveTo(-s*0.38+i*s*0.127,s*0.0);X.lineTo(-s*0.38+i*s*0.127,s*0.48);X.stroke()}
  // Çatı - düz endüstriyel
  X.fillStyle='#78909c';X.fillRect(-s*0.42,s*-0.06,s*0.84,s*0.08);
  X.fillStyle='#607d8b';X.fillRect(-s*0.44,s*-0.08,s*0.88,s*0.04);
  // Süt tankı (sol taraf) - silindirik çelik
  X.fillStyle='#b0bec5';X.beginPath();X.ellipse(-s*0.28,s*0.12,s*0.08,s*0.2,0,0,Math.PI*2);X.fill();
  X.fillStyle='#90a4ae';X.beginPath();X.ellipse(-s*0.28,s*0.12,s*0.06,s*0.18,0,0,Math.PI*2);X.fill();
  X.fillStyle='#cfd8dc';X.beginPath();X.ellipse(-s*0.28,s*0.12,s*0.03,s*0.16,0,0,Math.PI*2);X.fill();
  // Tank üstü kapak
  X.fillStyle='#78909c';X.beginPath();X.ellipse(-s*0.28,s*-0.08,s*0.08,s*0.02,0,0,Math.PI*2);X.fill();
  // Tank borusu
  X.fillStyle='#90a4ae';X.fillRect(-s*0.21,s*0.08,s*0.06,s*0.02);
  // Sağ tarafta ikinci tank
  X.fillStyle='#b0bec5';X.beginPath();X.ellipse(s*0.28,s*0.15,s*0.06,s*0.16,0,0,Math.PI*2);X.fill();
  X.fillStyle='#90a4ae';X.beginPath();X.ellipse(s*0.28,s*0.15,s*0.04,s*0.14,0,0,Math.PI*2);X.fill();
  X.fillStyle='#78909c';X.beginPath();X.ellipse(s*0.28,s*0.01,s*0.06,s*0.02,0,0,Math.PI*2);X.fill();
  // Kapı - çelik mavi
  X.fillStyle='#1565c0';X.beginPath();X.roundRect(-s*0.08,s*0.18,s*0.16,s*0.3,2);X.fill();
  X.fillStyle='#0d47a1';X.fillRect(-s*0.08,s*0.18,s*0.16,s*0.03);
  X.fillStyle='#bbdefb';X.beginPath();X.arc(s*0.06,s*0.33,s*0.012,0,Math.PI*2);X.fill();
  // Pencere - mavi cam
  X.fillStyle='#42a5f5';X.fillRect(s*0.12,s*0.1,s*0.14,s*0.12);
  X.fillStyle='#2196f3';X.fillRect(s*0.12,s*0.1,s*0.14,s*0.02);
  X.strokeStyle='#fff';X.lineWidth=0.5;X.strokeRect(s*0.12,s*0.1,s*0.14,s*0.12);
  // Boru hattı - üstten
  X.fillStyle='#78909c';X.fillRect(-s*0.15,s*0.02,s*0.3,s*0.025);
  X.fillStyle='#607d8b';X.beginPath();X.arc(-s*0.15,s*0.033,s*0.025,0,Math.PI*2);X.fill();
  X.fillStyle='#607d8b';X.beginPath();X.arc(s*0.15,s*0.033,s*0.025,0,Math.PI*2);X.fill();
  // Baca - ince çelik
  X.fillStyle='#607d8b';X.fillRect(s*0.22,s*-0.25,s*0.05,s*0.2);
  X.fillStyle='#546e7a';X.fillRect(s*0.2,s*-0.28,s*0.09,s*0.04);
  // Buhar
  X.fillStyle='rgba(200,220,240,0.4)';
  X.beginPath();X.arc(s*0.24,s*-0.32,s*0.03,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.27,s*-0.36,s*0.025,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.22,s*-0.39,s*0.02,0,Math.PI*2);X.fill();
  // Etiket
  X.fillStyle='#fff';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';
  X.fillText('SÜT İŞLEME',0,s*0.52);
  // Level
  let lv=S.buildingLevel?S.buildingLevel.sutislem||1:1;
  if(lv>=2){X.fillStyle='rgba(0,0,0,0.5)';X.beginPath();X.roundRect(-s*0.1,-s*0.42,s*0.2,s*0.1,3);X.fill();X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.fillText('Lv.'+lv,0,-s*0.35)}
  X.restore();
},

drawPeynirFab(x,y,s){
  X.save();X.translate(x,y);
  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.58,s*0.48,s*0.08,0,0,Math.PI*2);X.fill();
  // Temel - koyu taş
  let stoneC2=['#795548','#8d6e63','#6d4c41','#a1887f'];
  for(let i=0;i<4;i++){for(let j=0;j<6;j++){X.fillStyle=stoneC2[(i+j)%4];X.beginPath();X.roundRect(-s*0.42+j*s*0.14,s*0.48-i*4,s*0.12,3.5,1);X.fill()}}
  // Ana bina - sıcak tuğla
  X.fillStyle='#d84315';X.fillRect(-s*0.38,s*0.0,s*0.76,s*0.48);
  // Tuğla deseni
  X.strokeStyle='rgba(0,0,0,0.12)';X.lineWidth=0.5;
  for(let row=0;row<8;row++){
    let ry=s*0.0+row*s*0.06;
    for(let col=0;col<7;col++){
      let offset=(row%2)*s*0.055;
      X.strokeRect(-s*0.38+col*s*0.11+offset,ry,s*0.11,s*0.06);
    }
  }
  // Çatı - kiremit
  X.fillStyle='#bf360c';
  X.beginPath();X.moveTo(-s*0.44,s*0.0);X.lineTo(0,-s*0.22);X.lineTo(s*0.44,s*0.0);X.closePath();X.fill();
  // Kiremit satırları
  for(let i=0;i<4;i++){
    let ry=s*0.0-i*s*0.055;
    let rw=s*(0.44-i*0.09);
    X.fillStyle=i%2?'#a32600':'#8b1e00';
    X.beginPath();X.moveTo(-rw,ry);X.lineTo(rw,ry);X.lineTo(rw-s*0.015,ry-s*0.05);X.lineTo(-rw+s*0.015,ry-s*0.05);X.closePath();X.fill();
  }
  // Büyük kemerli kapı
  X.fillStyle='#3e2723';
  X.beginPath();X.moveTo(-s*0.1,s*0.48);X.lineTo(-s*0.1,s*0.18);
  X.arc(0,s*0.18,s*0.1,Math.PI,0);X.lineTo(s*0.1,s*0.48);X.closePath();X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.09,s*0.2,s*0.18,s*0.28);
  X.fillStyle='#4e342e';X.fillRect(-s*0.09,s*0.18,s*0.18,s*0.03);
  // Kapı kolu
  X.fillStyle='#ffd54f';X.beginPath();X.arc(s*0.06,s*0.34,s*0.012,0,Math.PI*2);X.fill();
  // Pencereler - kemerli
  X.fillStyle='#fff9c4';X.fillRect(-s*0.32,s*0.12,s*0.12,s*0.16);
  X.fillStyle='#fff59d';X.fillRect(-s*0.32,s*0.12,s*0.12,s*0.02);
  X.strokeStyle='#bf360c';X.lineWidth=1.5;X.strokeRect(-s*0.32,s*0.12,s*0.12,s*0.16);
  X.fillStyle='#fff9c4';X.fillRect(s*0.2,s*0.12,s*0.12,s*0.16);
  X.fillStyle='#fff59d';X.fillRect(s*0.2,s*0.12,s*0.12,s*0.02);
  X.strokeStyle='#bf360c';X.lineWidth=1.5;X.strokeRect(s*0.2,s*0.12,s*0.12,s*0.16);
  // Peynir tekerleği (sağda)
  X.fillStyle='#fdd835';X.beginPath();X.arc(s*0.26,s*0.42,s*0.06,0,Math.PI*2);X.fill();
  X.fillStyle='#f9a825';X.beginPath();X.arc(s*0.26,s*0.42,s*0.04,0,Math.PI*2);X.fill();
  X.fillStyle='#fff';X.beginPath();X.arc(s*0.25,s*0.41,s*0.008,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.27,s*0.43,s*0.006,0,Math.PI*2);X.fill();
  // Baca - tuğla
  X.fillStyle='#d84315';X.fillRect(-s*0.28,s*-0.28,s*0.06,s*0.22);
  X.fillStyle='#bf360c';X.fillRect(-s*0.3,s*-0.3,s*0.1,s*0.04);
  // Buhar
  X.fillStyle='rgba(200,180,160,0.35)';
  X.beginPath();X.arc(-s*0.25,s*-0.34,s*0.03,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(-s*0.22,s*-0.38,s*0.025,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(-s*0.27,s*-0.4,s*0.02,0,Math.PI*2);X.fill();
  // Etiket
  X.fillStyle='#fff';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';
  X.fillText('PEYNİR FAB',0,s*0.52);
  // Level
  let lv=S.buildingLevel?S.buildingLevel.peynirfab||1:1;
  if(lv>=2){X.fillStyle='rgba(0,0,0,0.5)';X.beginPath();X.roundRect(-s*0.1,-s*0.42,s*0.2,s*0.1,3);X.fill();X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.fillText('Lv.'+lv,0,-s*0.35)}
  X.restore();
},

drawSalcaFab(x,y,s){
  X.save();X.translate(x,y);
  // Gölge
  X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(0,s*0.58,s*0.48,s*0.08,0,0,Math.PI*2);X.fill();
  // Temel - gri-kahverengi
  let stoneC3=['#8d6e63','#795548','#a1887f','#6d4c41'];
  for(let i=0;i<4;i++){for(let j=0;j<6;j++){X.fillStyle=stoneC3[(i+j)%4];X.beginPath();X.roundRect(-s*0.42+j*s*0.14,s*0.48-i*4,s*0.12,3.5,1);X.fill()}}
  // Ana bina - koyu kırmızı tuğla
  X.fillStyle='#b71c1c';X.fillRect(-s*0.38,s*0.0,s*0.76,s*0.48);
  // Tuğla deseni
  X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.5;
  for(let row=0;row<8;row++){
    let ry=s*0.0+row*s*0.06;
    for(let col=0;col<7;col++){
      let offset=(row%2)*s*0.055;
      X.strokeRect(-s*0.38+col*s*0.11+offset,ry,s*0.11,s*0.06);
    }
  }
  // Çatı - düz endüstriyel
  X.fillStyle='#795548';X.fillRect(-s*0.42,s*-0.06,s*0.84,s*0.08);
  X.fillStyle='#6d4c41';X.fillRect(-s*0.44,s*-0.08,s*0.88,s*0.04);
  // Büyük pişirme kazanı (sol)
  X.fillStyle='#424242';X.beginPath();X.ellipse(-s*0.24,s*0.32,s*0.12,s*0.14,0,0,Math.PI*2);X.fill();
  X.fillStyle='#616161';X.beginPath();X.ellipse(-s*0.24,s*0.32,s*0.1,s*0.12,0,0,Math.PI*2);X.fill();
  X.fillStyle='#757575';X.beginPath();X.ellipse(-s*0.24,s*0.32,s*0.07,s*0.09,0,0,Math.PI*2);X.fill();
  // Kazan içi - kırmızı
  X.fillStyle='#c62828';X.beginPath();X.ellipse(-s*0.24,s*0.33,s*0.06,s*0.07,0,0,Math.PI*2);X.fill();
  X.fillStyle='#e53935';X.beginPath();X.ellipse(-s*0.24,s*0.32,s*0.04,s*0.05,0,0,Math.PI*2);X.fill();
  // Kazan borusu
  X.fillStyle='#616161';X.fillRect(-s*0.24,s*0.16,s*0.03,s*0.06);
  // Kapı - endüstriyel
  X.fillStyle='#3e2723';X.fillRect(-s*0.07,s*0.18,s*0.14,s*0.3);
  X.fillStyle='#5d4037';X.fillRect(-s*0.06,s*0.19,s*0.12,s*0.28);
  X.fillStyle='#ffd54f';X.beginPath();X.arc(s*0.04,s*0.33,s*0.012,0,Math.PI*2);X.fill();
  // Pencere
  X.fillStyle='#ffcdd2';X.fillRect(s*0.14,s*0.1,s*0.14,s*0.12);
  X.fillStyle='#ef9a9a';X.fillRect(s*0.14,s*0.1,s*0.14,s*0.02);
  X.strokeStyle='#b71c1c';X.lineWidth=1;X.strokeRect(s*0.14,s*0.1,s*0.14,s*0.12);
  // Domates kasaları (sağ alt)
  X.fillStyle='#8d6e63';X.fillRect(s*0.18,s*0.38,s*0.14,s*0.1);
  X.fillStyle='#795548';X.fillRect(s*0.18,s*0.36,s*0.14,s*0.03);
  // Domatesler kasada
  X.fillStyle='#e53935';
  X.beginPath();X.arc(s*0.22,s*0.41,s*0.025,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.26,s*0.42,s*0.022,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.3,s*0.41,s*0.02,0,Math.PI*2);X.fill();
  X.fillStyle='#c62828';
  X.beginPath();X.arc(s*0.22,s*0.41,s*0.015,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.26,s*0.42,s*0.012,0,Math.PI*2);X.fill();
  // Baca - yüksek endüstriyel
  X.fillStyle='#795548';X.fillRect(s*0.26,s*-0.35,s*0.06,s*0.3);
  X.fillStyle='#6d4c41';X.fillRect(s*0.24,s*-0.38,s*0.1,s*0.05);
  // Buhar - sıcak
  X.fillStyle='rgba(220,180,160,0.4)';
  X.beginPath();X.arc(s*0.29,s*-0.42,s*0.035,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.32,s*-0.47,s*0.03,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.27,s*-0.5,s*0.025,0,Math.PI*2);X.fill();
  // Etiket
  X.fillStyle='#fff';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';
  X.fillText('SALÇA FAB',0,s*0.52);
  // Level
  let lv=S.buildingLevel?S.buildingLevel.salçafab||1:1;
  if(lv>=2){X.fillStyle='rgba(0,0,0,0.5)';X.beginPath();X.roundRect(-s*0.1,-s*0.42,s*0.2,s*0.1,3);X.fill();X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.fillText('Lv.'+lv,0,-s*0.35)}
  X.restore();
},

drawStoneFoundation(x,y,w,h,colors){
  if(isMobile){
    X.fillStyle=colors[0];X.fillRect(x,y,w,h);
    X.strokeStyle='rgba(0,0,0,0.1)';X.lineWidth=0.5;
    X.strokeRect(x,y,w,h);
  }else{
    let rows=Math.ceil(h/5),cols=5;
    for(let i=0;i<rows;i++){for(let j=0;j<cols;j++){
      X.fillStyle=colors[(i+j)%colors.length];
      X.beginPath();X.roundRect(x+j*(w/cols)+(i%2)*(w/cols/2),y+i*5,w/cols-1,4,1);X.fill();
    }}
  }
},

drawBrickWall(x,y,w,h,brickColor,mortarColor){
  X.fillStyle=brickColor;X.fillRect(x,y,w,h);
  if(!isMobile){
    X.strokeStyle=mortarColor;X.lineWidth=0.5;
    let rows=Math.ceil(h/6),cols=Math.ceil(w/11);
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      let off=(r%2)*(w/cols/2);
      X.strokeRect(x+c*(w/cols)+off,y+r*6,w/cols,6);
    }}
  }
},

drawPlaceholder(x,y,s,label){
  X.save();X.translate(x,y);
  X.strokeStyle='rgba(200,149,108,0.5)';X.lineWidth=2;X.setLineDash([6,4]);
  X.beginPath();X.roundRect(-s*0.5,-s*0.4,s,s*0.8,4);X.stroke();
  X.setLineDash([]);
  X.fillStyle='rgba(200,149,108,0.15)';X.beginPath();X.roundRect(-s*0.5,-s*0.4,s,s*0.8,4);X.fill();
  X.fillStyle='rgba(200,149,108,0.6)';X.font='bold '+(s*0.12)+'px "Nunito",Arial,sans-serif';X.textAlign='center';X.textBaseline='middle';
  X.fillText(label,0,0);
  X.fillStyle='rgba(200,149,108,0.4)';X.font=(s*0.2)+'px "Nunito",Arial,sans-serif';
  X.fillText('+',0,-s*0.08);
  X.restore();
},

drawMiniWindmill(ctx,s){
  ctx.save();ctx.translate(s/2,s/2);
  ctx.fillStyle='#d7ccc8';ctx.fillRect(-3,-s*0.15,6,s*0.35);
  ctx.fillStyle='#8d6e63';
  ctx.fillRect(-s*0.2,-s*0.05,s*0.4,s*0.15);
  ctx.save();ctx.translate(0,-s*0.15);
  let a=Date.now()/1500;ctx.rotate(a);
  ctx.fillStyle='#d7ccc8';
  ctx.fillRect(-2,-s*0.15,4,s*0.15);ctx.fillRect(-2,0,4,s*0.15);
  ctx.fillRect(-s*0.15,-2,s*0.15,4);ctx.fillRect(0,-2,s*0.15,4);
  ctx.restore();
  ctx.restore();
},

drawMiniWell(ctx,s){
  ctx.save();ctx.translate(s/2,s/2);
  ctx.fillStyle='#78909c';ctx.beginPath();ctx.arc(0,0,s*0.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#90a4ae';ctx.beginPath();ctx.arc(0,0,s*0.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#42a5f5';ctx.beginPath();ctx.arc(0,0,s*0.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8d6e63';ctx.fillRect(-s*0.03,-s*0.35,s*0.06,s*0.35);
  ctx.fillRect(s*0.05,-s*0.35,s*0.06,s*0.35);
  ctx.fillStyle='#795548';ctx.fillRect(-s*0.2,-s*0.38,s*0.4,s*0.05);
  ctx.restore();
},

drawMiniBarn(ctx,s){
  ctx.save();ctx.translate(s/2,s/2);
  ctx.fillStyle='#c62828';ctx.beginPath();ctx.moveTo(-s*0.25,s*0.1);ctx.lineTo(0,-s*0.2);ctx.lineTo(s*0.25,s*0.1);ctx.closePath();ctx.fill();
  ctx.fillRect(-s*0.25,-s*0.05,s*0.5,s*0.15);
  ctx.fillStyle='#fff';ctx.font='bold '+(s*0.08)+'px "Nunito",Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('AHİR',0,s*0.02);
  ctx.restore();
},

drawMiniKümes(ctx,s){
  ctx.save();ctx.translate(s/2,s/2);
  ctx.fillStyle='#795548';ctx.beginPath();ctx.moveTo(-s*0.22,s*0.08);ctx.lineTo(0,-s*0.18);ctx.lineTo(s*0.22,s*0.08);ctx.closePath();ctx.fill();
  ctx.fillRect(-s*0.22,-s*0.05,s*0.44,s*0.13);
  ctx.fillStyle='#fff';ctx.font='bold '+(s*0.07)+'px "Nunito",Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('KÜMES',0,s*0.01);
  ctx.restore();
},

drawWell(x,y,s){
  X.save();X.translate(x,y);

  // Gölge
  X.fillStyle='rgba(0,0,0,0.12)';
  X.beginPath();X.ellipse(0,s*0.35,s*0.5,s*0.1,0,0,Math.PI*2);X.fill();

  // Ahşap zemin platformu
  X.fillStyle='#6d4c41';
  X.beginPath();X.ellipse(0,s*0.3,s*0.48,s*0.08,0,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';
  X.beginPath();X.ellipse(0,s*0.28,s*0.48,s*0.08,0,0,Math.PI*2);X.fill();
  // Ahşap tahta çizgileri
  X.strokeStyle='rgba(0,0,0,0.15)';X.lineWidth=0.8;
  for(let i=-3;i<=3;i++){
    X.beginPath();X.moveTo(i*s*0.13,s*0.2);X.lineTo(i*s*0.16,s*0.36);X.stroke();
  }

  // Taş duvar - yuvarlak kuyu gövdesi
  let stoneColors=['#9e9e9e','#b0b0b0','#888','#a5a5a5','#90a4ae'];
  for(let row=0;row<4;row++){
    let ry=s*0.22-row*s*0.06;
    let rw=s*(0.38-row*0.02);
    for(let col=0;col<8;col++){
      let tx=-rw+col*(rw*2/8)+(row%2)*rw/8;
      X.fillStyle=stoneColors[(row+col)%stoneColors.length];
      X.beginPath();X.roundRect(tx,ry,rw*2/8-1,s*0.055,1);X.fill();
      X.strokeStyle='rgba(0,0,0,0.12)';X.lineWidth=0.5;
      X.beginPath();X.roundRect(tx,ry,rw*2/8-1,s*0.055,1);X.stroke();
    }
  }

  // İç su
  X.fillStyle='#29b6f6';
  X.beginPath();X.ellipse(0,s*0.12,s*0.3,s*0.08,0,0,Math.PI*2);X.fill();
  // Su parlaklığı
  let t=Date.now()/2000;
  X.fillStyle=`rgba(255,255,255,${0.15+Math.sin(t)*0.08})`;
  X.beginPath();X.ellipse(-s*0.08,s*0.1+Math.sin(t)*s*0.01,s*0.1,s*0.03,0.2,0,Math.PI*2);X.fill();

  // Ahşap sütunlar
  X.fillStyle='#8d6e63';
  X.fillRect(-s*0.35,-s*0.4,s*0.06,s*0.65);
  X.fillRect(s*0.29,-s*0.4,s*0.06,s*0.65);
  // Sütun doku
  X.fillStyle='rgba(0,0,0,0.1)';
  X.fillRect(-s*0.35,-s*0.4,s*0.02,s*0.65);
  X.fillRect(s*0.29,-s*0.4,s*0.02,s*0.65);

  // Çatı kirişi - yatay
  X.fillStyle='#6d4c41';
  X.fillRect(-s*0.42,-s*0.42,s*0.84,s*0.05);

  // Çatı - kırmızı kiremit
  X.fillStyle='#c0392b';
  X.beginPath();X.moveTo(-s*0.48,-s*0.42);X.lineTo(0,-s*0.58);X.lineTo(s*0.48,-s*0.42);X.closePath();X.fill();
  // Çatı arka
  X.fillStyle='#a93226';
  X.beginPath();X.moveTo(-s*0.46,-s*0.41);X.lineTo(0,-s*0.56);X.lineTo(s*0.46,-s*0.41);X.closePath();X.fill();
  // Kiremit satırları
  for(let i=0;i<4;i++){
    let ry=-s*0.42-i*s*0.04;
    let rw=s*(0.46-i*0.08);
    X.fillStyle=i%2?'#c0392b':'#e74c3c';
    X.beginPath();X.moveTo(-rw,ry);X.lineTo(rw,ry);X.lineTo(rw-s*0.02,ry-s*0.035);X.lineTo(-rw+s*0.02,ry-s*0.035);X.closePath();X.fill();
  }
  // Çatı kenar bordür
  X.strokeStyle='#922b21';X.lineWidth=1.5;
  X.beginPath();X.moveTo(-s*0.48,-s*0.42);X.lineTo(0,-s*0.58);X.lineTo(s*0.48,-s*0.42);X.stroke();

  // Ahşap çapraz destekler
  X.strokeStyle='#8d6e63';X.lineWidth=2;
  X.beginPath();X.moveTo(-s*0.35,-s*0.4);X.lineTo(-s*0.1,-s*0.22);X.stroke();
  X.beginPath();X.moveTo(s*0.35,-s*0.4);X.lineTo(s*0.1,-s*0.22);X.stroke();

  // Makara/ruzgar
  X.fillStyle='#5d4037';
  X.fillRect(-s*0.08,-s*0.38,s*0.16,s*0.04);
  X.fillStyle='#8d6e63';
  X.beginPath();X.arc(-s*0.08,-s*0.36,s*0.03,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.08,-s*0.36,s*0.03,0,Math.PI*2);X.fill();

  // İp
  X.strokeStyle='#a1887f';X.lineWidth=1.2;
  X.beginPath();X.moveTo(0,-s*0.36);X.lineTo(0,s*0.02);X.stroke();

  // Kova
  X.fillStyle='#78909c';
  X.beginPath();X.moveTo(-s*0.05,s*0.0);X.lineTo(-s*0.06,s*0.1);
  X.lineTo(s*0.06,s*0.1);X.lineTo(s*0.05,s*0.0);X.closePath();X.fill();
  X.fillStyle='#90a4ae';
  X.beginPath();X.moveTo(-s*0.05,s*0.0);X.lineTo(-s*0.06,s*0.1);
  X.lineTo(s*0.06,s*0.1);X.lineTo(s*0.05,s*0.0);X.closePath();X.fill();
  // Kova kulpu
  X.strokeStyle='#607d8b';X.lineWidth=1.5;
  X.beginPath();X.arc(0,-s*0.02,s*0.04,Math.PI,0);X.stroke();
  // Kova su dolu
  X.fillStyle='rgba(41,182,246,0.5)';
  X.beginPath();X.moveTo(-s*0.04,s*0.02);X.lineTo(-s*0.05,s*0.08);
  X.lineTo(s*0.05,s*0.08);X.lineTo(s*0.04,s*0.02);X.closePath();X.fill();

  // Seviye göstergesi
  let wLv=S.buildingLevel?S.buildingLevel.kuyu||1:1;
  if(wLv>=2){
    X.fillStyle='rgba(0,0,0,0.4)';X.beginPath();X.roundRect(-s*0.1,-s*0.45,s*0.2,s*0.1,3);X.fill();
    X.fillStyle='#ffd54f';X.font=`bold ${s*0.06}px "Nunito",Arial,sans-serif`;X.textAlign='center';X.fillText('Lv.'+wLv,0,-s*0.38);
  }

  X.restore();
},

drawScarecrow(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#8d6e63';X.fillRect(-1,0,2,s*0.5);
  X.fillStyle='#a1887f';X.fillRect(-s*0.25,-s*0.02,s*0.5,2);
  X.fillStyle='#795548';X.beginPath();X.arc(0,-s*0.15,s*0.08,0,Math.PI*2);X.fill();
  X.fillStyle='#ff9800';X.beginPath();X.moveTo(-s*0.1,-s*0.18);X.lineTo(0,-s*0.28);X.lineTo(s*0.1,-s*0.18);X.closePath();X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.12,-s*0.22,s*0.24,s*0.04);
  X.fillStyle='#e8d5b0';X.fillRect(-s*0.06,-s*0.16,s*0.12,s*0.1);
  X.fillStyle='#000';X.beginPath();X.arc(-s*0.02,-s*0.12,1,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.02,-s*0.12,1,0,Math.PI*2);X.fill();
  X.restore();
},

drawWoodenCart(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(0,s*0.35,s*0.5,s*0.08,0,0,Math.PI*2);X.fill();
  X.fillStyle='#5d4037';X.fillRect(-s*0.4,-s*0.15,s*0.8,s*0.35);
  X.fillStyle='#6d4c41';X.fillRect(-s*0.38,-s*0.12,s*0.76,s*0.04);
  X.fillStyle='#4e342e';X.fillRect(-s*0.38,s*0.12,s*0.76,s*0.04);
  X.fillStyle='#8d6e63';X.fillRect(-s*0.45,-s*0.2,s*0.1,s*0.1);
  X.fillRect(s*0.35,-s*0.2,s*0.1,s*0.1);
  X.fillStyle='#333';X.beginPath();X.arc(-s*0.3,s*0.22,s*0.08,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.3,s*0.22,s*0.08,0,Math.PI*2);X.fill();
  X.fillStyle='#555';X.beginPath();X.arc(-s*0.3,s*0.22,s*0.04,0,Math.PI*2);X.fill();
  X.beginPath();X.arc(s*0.3,s*0.22,s*0.04,0,Math.PI*2);X.fill();
  X.fillStyle='#c8a84e';X.fillRect(-s*0.3,-s*0.2,s*0.6,s*0.08);
  X.restore();
},

drawDuck(x,y,s){
  X.save();X.translate(x,y);
  // Su dalgası
  X.strokeStyle='rgba(100,180,255,0.3)';X.lineWidth=0.8;
  for(let i=0;i<3;i++){
    X.beginPath();X.ellipse(0,i*2,s*(0.4-i*0.1),s*0.04,0,0,Math.PI*2);X.stroke();
  }
  // Vücut
  X.fillStyle='#fff';X.beginPath();X.ellipse(0,0,s*0.2,s*0.1,0,0,Math.PI*2);X.fill();
  // Kanat
  X.fillStyle='#e0e0e0';X.beginPath();X.ellipse(-s*0.05,-s*0.02,s*0.12,s*0.06,.1,0,Math.PI*2);X.fill();
  // Kafa - yeşil (erkeler)
  X.fillStyle='#2e7d32';X.beginPath();X.arc(s*0.15,-s*0.06,s*0.07,0,Math.PI*2);X.fill();
  // Gaga
  X.fillStyle='#ff9800';
  X.beginPath();X.moveTo(s*0.22,-s*0.06);X.lineTo(s*0.3,-s*0.04);X.lineTo(s*0.22,-s*0.02);X.closePath();X.fill();
  // Göz
  X.fillStyle='#fff';X.beginPath();X.arc(s*0.18,-s*0.07,s*0.018,0,Math.PI*2);X.fill();
  X.fillStyle='#000';X.beginPath();X.arc(s*0.19,-s*0.07,s*0.008,0,Math.PI*2);X.fill();
  X.restore();
},

drawWaterTank(x,y,s){
  X.save();X.translate(x,y);
  X.fillStyle='#78909c';X.fillRect(-s*0.3,-s*0.4,s*0.6,s*0.8);
  X.fillStyle='#90a4ae';X.fillRect(-s*0.28,-s*0.38,s*0.56,s*0.76);
  X.fillStyle='#607d8b';X.fillRect(-s*0.32,-s*0.42,s*0.64,s*0.06);
  X.fillRect(-s*0.32,s*0.36,s*0.64,s*0.06);
  X.fillStyle='rgba(66,165,245,0.4)';X.fillRect(-s*0.24,-s*0.34,s*0.48,s*0.68);
  X.restore();
},

drawOrganicPath(points,width){
  if(points.length<2)return;
  X.fillStyle='rgba(160,120,70,0.65)';
  X.beginPath();
  let p0=points[0],p1=points[1];
  let dx=p1.x-p0.x,dy=p1.y-p0.y,len=Math.sqrt(dx*dx+dy*dy);
  let nx=-dy/len*width/2,ny=dx/len*width/2;
  X.moveTo(p0.x+nx,p0.y+ny);
  for(let i=1;i<points.length;i++){
    let pp=points[i-1],cp=points[i];
    X.lineTo(cp.x+(cp.x-pp.x>0?nx*-0.5:nx*0.5),cp.y+(cp.y-pp.y>0?ny*-0.5:ny*0.5));
  }
  for(let i=points.length-1;i>=0;i--){
    let pp=i>0?points[i-1]:points[0],cp=points[i];
    X.lineTo(cp.x-(cp.x-pp.x>0?nx*-0.5:nx*0.5),cp.y-(cp.y-pp.y>0?ny*-0.5:ny*0.5));
  }
  X.closePath();X.fill();
},

drawHouseToCanvas(c,s){
  c.save();c.translate(s/2,s/2+10);
  c.fillStyle='#a0522d';c.beginPath();c.moveTo(-28,12);c.lineTo(0,-22);c.lineTo(28,12);c.closePath();c.fill();
  c.fillStyle='#c8884a';c.fillRect(-24,12,48,30);
  c.fillStyle='#6d4c41';c.fillRect(-6,24,12,18);
  c.fillStyle='#87CEEB';c.fillRect(-20,18,8,8);c.fillRect(12,18,8,8);
  c.fillStyle='#999';c.fillRect(16,-10,5,20);
  c.restore();
},

drawBarnToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  let lv=S.buildingLevel?S.buildingLevel.ahır||1:1;
  let r=40+lv*3,g=24+lv*2,b=0;
  c.fillStyle=`rgb(${r},${g},${b})`;c.fillRect(-28,0,56,32);
  c.fillStyle='#5B0E00';c.fillRect(-3,0,6,32);
  c.fillStyle='#6B1800';c.beginPath();c.moveTo(-32,0);c.lineTo(0,-20);c.lineTo(32,0);c.closePath();c.fill();
  c.fillStyle='#3e2723';c.fillRect(-10,10,20,22);
  c.fillStyle='#ffe082';c.beginPath();c.arc(-4,20,2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(4,20,2,0,Math.PI*2);c.fill();
  c.fillStyle='#d4a040';c.fillRect(-12,-2,24,8);
  c.fillStyle='#3a2010';c.font='bold 7px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('AHİR',0,5);
  c.strokeStyle='#8B6508';c.lineWidth=1.5;
  let fW=34+lv*4,fH=14+lv*3;
  c.strokeRect(-fW/2,34,fW,fH);
  c.fillStyle='#6B4500';
  for(let i=0;i<Math.min(lv,5);i++){let fx=-fW/2+4+i*(fW-6)/Math.min(lv,5);c.fillRect(fx,36,2,fH-4)}
  if(lv>=3){c.fillStyle='#ffd54f';c.font='bold 6px "Nunito",Arial,sans-serif';c.fillText('Lv.'+lv,0,34+fH+8)}
  c.restore();
},

drawKümesToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  let lv=S.buildingLevel?S.buildingLevel.kümes||1:1;
  let d=Math.min(lv*2,18);
  c.fillStyle=`rgb(${139+d},${105-d/2},${20+d})`;c.fillRect(-28,0,56,32);
  c.fillStyle='#654321';c.beginPath();c.moveTo(-32,0);c.lineTo(0,-20);c.lineTo(32,0);c.closePath();c.fill();
  c.fillStyle='#3e2723';c.beginPath();c.arc(0,26,7,Math.PI,0);c.fill();
  c.fillStyle='#d4a040';c.fillRect(-14,-2,28,8);
  c.fillStyle='#3a2010';c.font='bold 6px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('KÜMES',0,5);
  c.strokeStyle='#8B6508';c.lineWidth=1.5;
  let fW=30+lv*3,fH=12+lv*2;
  c.strokeRect(-fW/2,34,fW,fH);
  c.fillStyle='#6B4500';
  for(let i=0;i<Math.min(lv,5);i++){let fx=-fW/2+4+i*(fW-6)/Math.min(lv,5);c.fillRect(fx,36,2,fH-4)}
  if(lv>=3){c.fillStyle='#ffd54f';c.font='bold 6px "Nunito",Arial,sans-serif';c.fillText('Lv.'+lv,0,34+fH+8)}
  c.restore();
},

drawWindmillToCanvas(c,s){
  c.save();c.translate(s/2,s/2+10);
  let lv=S.buildingLevel?S.buildingLevel.degirmen||1:1;
  c.fillStyle='#e8e0d0';c.beginPath();c.moveTo(-14,22);c.lineTo(-10,-14);c.lineTo(10,-14);c.lineTo(14,22);c.closePath();c.fill();
  c.fillStyle='#8d6e63';c.beginPath();c.moveTo(-12,-14);c.lineTo(0,-26);c.lineTo(12,-14);c.closePath();c.fill();
  c.fillStyle='#87CEEB';c.beginPath();c.arc(0,2,5,0,Math.PI*2);c.fill();
  c.fillStyle='#d7ccc8';
  c.fillRect(-1.5,-14,3,18);c.fillRect(-1.5,4,3,18);
  c.fillRect(-14,-2,18,3);c.fillRect(4,-2,18,3);
  c.fillStyle='#5d4037';c.beginPath();c.arc(0,-2,3,0,Math.PI*2);c.fill();
  if(lv>=2){c.fillStyle='#ffd54f';c.font='bold 6px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('Lv.'+lv,0,20)}
  c.restore();
},

drawWellToCanvas(c,s){
  c.save();c.translate(s/2,s/2+8);
  let lv=S.buildingLevel?S.buildingLevel.kuyu||1:1;
  let stoneC=['#90a4ae','#78909c'];
  for(let row=0;row<3;row++){
    for(let col=0;col<6;col++){
      c.fillStyle=stoneC[(row+col)%2];
      c.fillRect(-22+col*8+(row%2)*4,6-row*5,7,4.5);
    }
  }
  c.fillStyle='#29b6f6';c.beginPath();c.ellipse(0,4,14,4,0,0,Math.PI*2);c.fill();
  c.fillStyle='#8d6e63';c.fillRect(-20,-16,3,24);c.fillRect(17,-16,3,24);
  c.fillStyle='#c0392b';c.beginPath();c.moveTo(-24,-16);c.lineTo(0,-28);c.lineTo(24,-16);c.closePath();c.fill();
  c.strokeStyle='#a1887f';c.lineWidth=1;c.beginPath();c.moveTo(0,-16);c.lineTo(0,2);c.stroke();
  c.fillStyle='#78909c';c.fillRect(-3,0,6,5);
  if(lv>=2){c.fillStyle='#ffd54f';c.font='bold 6px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('Lv.'+lv,0,-30)}
  c.restore();
},

drawFırınToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  let lv=S.buildingLevel?S.buildingLevel.fırın||1:1;
  c.fillStyle='#d84315';c.fillRect(-28,0,56,28);
  c.fillStyle='#bf360c';c.beginPath();c.moveTo(-32,0);c.lineTo(0,-18);c.lineTo(32,0);c.closePath();c.fill();
  c.fillStyle='#3e2723';c.fillRect(-12,8,24,20);
  c.fillStyle='#ff6f00';c.beginPath();c.arc(0,22,6,0,Math.PI*2);c.fill();
  c.fillStyle='#ffab00';c.beginPath();c.arc(0,22,3,0,Math.PI*2);c.fill();
  c.fillStyle='#5d4037';c.fillRect(-6,-14,12,14);
  c.fillStyle='#424242';c.fillRect(8,-8,10,6);
  if(lv>=2){c.fillStyle='#ffd54f';c.font='bold 6px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('Lv.'+lv,0,-22)}
  c.restore();
},

drawSutIslemToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  // Temel
  c.fillStyle='#b0b0b0';c.fillRect(-30,12,60,8);
  // Bina
  c.fillStyle='#e0e0e0';c.fillRect(-26,-4,52,20);
  c.fillStyle='#d0d0d0';c.fillRect(-26,-4,52,2);
  // Çatı
  c.fillStyle='#78909c';c.fillRect(-28,-8,56,5);
  // Tank sol
  c.fillStyle='#b0bec5';c.beginPath();c.ellipse(-16,4,6,10,0,0,Math.PI*2);c.fill();
  c.fillStyle='#90a4ae';c.beginPath();c.ellipse(-16,4,4,8,0,0,Math.PI*2);c.fill();
  c.fillStyle='#cfd8dc';c.beginPath();c.ellipse(-16,4,2,6,0,0,Math.PI*2);c.fill();
  c.fillStyle='#78909c';c.beginPath();c.ellipse(-16,-6,6,1.5,0,0,Math.PI*2);c.fill();
  // Tank sağ
  c.fillStyle='#b0bec5';c.beginPath();c.ellipse(16,6,4,7,0,0,Math.PI*2);c.fill();
  c.fillStyle='#90a4ae';c.beginPath();c.ellipse(16,6,3,5,0,0,Math.PI*2);c.fill();
  // Kapı
  c.fillStyle='#1565c0';c.beginPath();c.roundRect(-5,2,10,14,1);c.fill();
  c.fillStyle='#bbdefb';c.beginPath();c.arc(3,9,1,0,Math.PI*2);c.fill();
  // Baca
  c.fillStyle='#607d8b';c.fillRect(14,-16,4,10);
  c.fillStyle='#546e7a';c.fillRect(13,-18,6,3);
  // Etiket
  c.fillStyle='#fff';c.font='bold 5px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('SÜT',0,1);
  c.restore();
},

drawPeynirFabToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  // Temel
  c.fillStyle='#8d6e63';c.fillRect(-30,12,60,8);
  // Bina
  c.fillStyle='#d84315';c.fillRect(-26,-4,52,20);
  // Tuğla
  c.strokeStyle='rgba(0,0,0,0.12)';c.lineWidth=0.5;
  for(let r=0;r<3;r++){for(let col=0;col<5;col++){let off=(r%2)*5;c.strokeRect(-26+col*10.4+off,-4+r*6.6,10.4,6.6)}}
  // Çatı kiremit
  c.fillStyle='#bf360c';c.beginPath();c.moveTo(-28,-4);c.lineTo(0,-14);c.lineTo(28,-4);c.closePath();c.fill();
  c.fillStyle='#a32600';c.beginPath();c.moveTo(-28,-4);c.lineTo(0,-10);c.lineTo(28,-4);c.closePath();c.fill();
  // Kapı kemerli
  c.fillStyle='#3e2723';c.beginPath();c.moveTo(-5,16);c.lineTo(-5,2);c.arc(0,2,5,Math.PI,0);c.lineTo(5,16);c.closePath();c.fill();
  c.fillStyle='#5d4037';c.fillRect(-4,3,8,13);
  // Pencere
  c.fillStyle='#fff9c4';c.fillRect(-20,0,8,7);c.strokeRect(-20,0,8,7);
  c.fillStyle='#fff9c4';c.fillRect(12,0,8,7);c.strokeRect(12,0,8,7);
  // Peynir
  c.fillStyle='#fdd835';c.beginPath();c.arc(18,12,4,0,Math.PI*2);c.fill();
  c.fillStyle='#f9a825';c.beginPath();c.arc(18,12,2.5,0,Math.PI*2);c.fill();
  // Etiket
  c.fillStyle='#fff';c.font='bold 5px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('PEYNİR',0,1);
  c.restore();
},

drawSalcaFabToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  // Temel
  c.fillStyle='#795548';c.fillRect(-30,12,60,8);
  // Bina
  c.fillStyle='#b71c1c';c.fillRect(-26,-4,52,20);
  // Tuğla
  c.strokeStyle='rgba(0,0,0,0.15)';c.lineWidth=0.5;
  for(let r=0;r<3;r++){for(let col=0;col<5;col++){let off=(r%2)*5;c.strokeRect(-26+col*10.4+off,-4+r*6.6,10.4,6.6)}}
  // Çatı
  c.fillStyle='#795548';c.fillRect(-28,-8,56,5);
  c.fillStyle='#6d4c41';c.fillRect(-30,-10,60,3);
  // Kazan
  c.fillStyle='#424242';c.beginPath();c.ellipse(-14,8,8,7,0,0,Math.PI*2);c.fill();
  c.fillStyle='#616161';c.beginPath();c.ellipse(-14,8,6,5,0,0,Math.PI*2);c.fill();
  c.fillStyle='#c62828';c.beginPath();c.ellipse(-14,8,4,3.5,0,0,Math.PI*2);c.fill();
  // Kapı
  c.fillStyle='#3e2723';c.fillRect(-4,2,8,14);
  c.fillStyle='#5d4037';c.fillRect(-3,3,6,13);
  // Domates kasası
  c.fillStyle='#8d6e63';c.fillRect(10,10,14,6);
  c.fillStyle='#e53935';c.beginPath();c.arc(14,12,2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(18,13,1.8,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(21,12,1.5,0,Math.PI*2);c.fill();
  // Baca
  c.fillStyle='#795548';c.fillRect(14,-16,5,10);
  c.fillStyle='#6d4c41';c.fillRect(13,-18,7,3);
  // Etiket
  c.fillStyle='#fff';c.font='bold 5px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('SALÇA',0,1);
  c.restore();
},

drawGridToCanvas(c,s){
  c.save();c.translate(s/2,s/2);
  c.fillStyle='#6d4c41';c.fillRect(-30,-22,60,44);
  c.fillStyle='#3e2723';c.fillRect(-26,-18,52,36);
  c.strokeStyle='#5d4037';c.lineWidth=2;
  for(let i=0;i<10;i++){c.beginPath();c.moveTo(-26+i*5.2,-18);c.lineTo(-26+i*5.2,18);c.stroke()}
  for(let i=0;i<5;i++){c.beginPath();c.moveTo(-26,-18+i*9);c.lineTo(26,-18+i*9);c.stroke()}
  c.restore();
},

drawMiniCrop(c,type,s){
  c.save();c.translate(s/2,s/2);
  let cols=GameManager.CROPS[type];if(!cols){c.restore();return}
  let c1=cols.col[0],c2=cols.col[1];
  if(type==='DOMATES'){
    c.fillStyle='#4caf50';c.fillRect(-1,-s*0.35,2,s*0.25);
    c.fillStyle=c2;c.beginPath();c.arc(0,0,s*0.28,0,Math.PI*2);c.fill();
    c.fillStyle=c1;c.beginPath();c.arc(0,0,s*0.2,0,Math.PI*2);c.fill();
    c.fillStyle='#4caf50';c.fillRect(-s*0.08,-s*0.3,s*0.16,s*0.08);
  }else if(type==='PATATES'){
    c.fillStyle=c1;c.beginPath();c.ellipse(0,0,s*0.3,s*0.2,0,0,Math.PI*2);c.fill();
    c.fillStyle=c2;c.beginPath();c.ellipse(s*0.05,-s*0.05,s*0.12,s*0.08,.3,0,Math.PI*2);c.fill();
  }else if(type==='SALATALIK'){
    c.fillStyle=c2;c.beginPath();c.ellipse(0,0,s*0.12,s*0.3,0,0,Math.PI*2);c.fill();
    c.fillStyle=c1;c.beginPath();c.ellipse(-s*0.02,s*0.05,s*0.08,s*0.2,0,0,Math.PI*2);c.fill();
  }else if(type==='MARUL'){
    c.fillStyle=c2;c.beginPath();c.arc(0,0,s*0.28,0,Math.PI*2);c.fill();
    c.fillStyle=c1;c.beginPath();c.arc(0,-s*0.05,s*0.2,0,Math.PI*2);c.fill();
    c.fillStyle='#81c784';c.beginPath();c.arc(0,0,s*0.12,0,Math.PI*2);c.fill();
  }else if(type==='BIBER'){
    c.fillStyle='#4caf50';c.fillRect(-1,-s*0.35,2,s*0.2);
    c.fillStyle=c2;c.beginPath();c.moveTo(0,-s*0.15);c.quadraticCurveTo(s*0.2,0,0,s*0.3);c.quadraticCurveTo(-s*0.2,0,0,-s*0.15);c.fill();
    c.fillStyle=c1;c.beginPath();c.moveTo(0,-s*0.1);c.quadraticCurveTo(s*0.12,0,0,s*0.2);c.quadraticCurveTo(-s*0.12,0,0,-s*0.1);c.fill();
  }else if(type==='PATLICAN'){
    c.fillStyle=c2;c.beginPath();c.ellipse(0,0,s*0.15,s*0.3,0,0,Math.PI*2);c.fill();
    c.fillStyle=c1;c.beginPath();c.ellipse(s*0.03,0,s*0.1,s*0.22,.1,0,Math.PI*2);c.fill();
    c.fillStyle='#4caf50';c.fillRect(-s*0.06,-s*0.35,s*0.12,s*0.08);
  }else if(type==='MISIR'){
    c.fillStyle=c1;c.beginPath();c.ellipse(0,0,s*0.12,s*0.3,0,0,Math.PI*2);c.fill();
    c.fillStyle=c2;for(let i=0;i<5;i++){c.beginPath();c.arc(0,-s*0.15+i*s*0.08,s*0.04,0,Math.PI*2);c.fill()}
    c.fillStyle='#4caf50';c.fillRect(-s*0.15,-s*0.35,s*0.3,s*0.1);
  }else if(type==='KABAK'){
    c.fillStyle=c2;c.beginPath();c.arc(0,s*0.05,s*0.25,0,Math.PI*2);c.fill();
    c.fillStyle=c1;c.beginPath();c.arc(0,s*0.05,s*0.18,0,Math.PI*2);c.fill();
    c.fillStyle='#4caf50';c.fillRect(-1,-s*0.3,2,s*0.15);
  }else if(type==='SOGAN'){
    c.fillStyle=c1;c.beginPath();c.arc(0,s*0.05,s*0.22,0,Math.PI*2);c.fill();
    c.fillStyle=c2;c.beginPath();c.arc(0,s*0.02,s*0.16,0,Math.PI*2);c.fill();
    c.fillStyle='#8d6e63';c.fillRect(-1,-s*0.25,2,s*0.15);
  }else if(type==='BUGDAY'){
    c.fillStyle='#8d6e63';c.fillRect(-1,-s*0.35,2,s*0.5);
    c.fillStyle=c1;for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,-s*0.25+i*s*0.08,s*0.06,s*0.03,-.3*(i%2?1:-1),0,Math.PI*2);c.fill()}
  }
  c.restore();
},

drawMiniAnimal(c,type,s){
  c.save();c.translate(s/2,s/2);
  if(type==='TAVUK'){
    // Yandan gorunum
    c.fillStyle='#f5deb3';c.beginPath();c.ellipse(-s*0.05,s*0.02,s*0.28,s*0.16,0,0,Math.PI*2);c.fill();
    c.fillStyle='#deb887';c.beginPath();c.ellipse(-s*0.08,s*0.05,s*0.18,s*0.1,0,0,Math.PI*2);c.fill();
    // Kanat
    c.fillStyle='#d2b488';c.beginPath();c.ellipse(-s*0.1,s*0,s*0.12,s*0.08,.2,0,Math.PI*2);c.fill();
    // Kafa
    c.fillStyle='#8d6e63';c.beginPath();c.arc(s*0.2,-s*0.06,s*0.1,0,Math.PI*2);c.fill();
    // Goz
    c.fillStyle='#fff';c.beginPath();c.arc(s*0.23,-s*0.08,s*0.03,0,Math.PI*2);c.fill();
    c.fillStyle='#000';c.beginPath();c.arc(s*0.24,-s*0.08,s*0.015,0,Math.PI*2);c.fill();
    // Gaga
    c.fillStyle='#ff5722';c.beginPath();c.moveTo(s*0.28,-s*0.05);c.lineTo(s*0.35,-s*0.03);c.lineTo(s*0.28,-s*0.01);c.closePath();c.fill();
    // Tavuk dibi
    c.fillStyle='#ff5722';c.fillRect(s*0.17,-s*0.16,s*0.05,s*0.06);
    // Bacaklar
    c.fillStyle='#ff8a65';c.fillRect(-s*0.05,s*0.14,2,s*0.1);c.fillRect(s*0.05,s*0.14,2,s*0.1);
    // Kuyruk
    c.fillStyle='#8d6e63';c.beginPath();c.moveTo(-s*0.28,s*0);c.lineTo(-s*0.38,-s*0.1);c.lineTo(-s*0.32,-s*0.02);c.closePath();c.fill();
  }else if(type==='INEK'){
    // Yandan gorunum
    c.fillStyle='#fff';c.beginPath();c.ellipse(0,s*0.02,s*0.32,s*0.16,0,0,Math.PI*2);c.fill();
    // Kahverengi lekeler
    c.fillStyle='#8d6e63';c.beginPath();c.ellipse(-s*0.08,-s*0.02,s*0.1,s*0.08,.3,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(s*0.1,s*0.05,s*0.08,s*0.06,-.2,0,Math.PI*2);c.fill();
    // Karin
    c.fillStyle='#fafafa';c.beginPath();c.ellipse(0,s*0.1,s*0.2,s*0.06,0,0,Math.PI*2);c.fill();
    // Bas
    c.fillStyle='#fff';c.beginPath();c.ellipse(s*0.3,-s*0.06,s*0.1,s*0.08,0,0,Math.PI*2);c.fill();
    // Gogs
    c.fillStyle='#e8e0d0';c.beginPath();c.ellipse(s*0.32,s*0.02,s*0.06,s*0.05,0,0,Math.PI*2);c.fill();
    // Goz
    c.fillStyle='#000';c.beginPath();c.arc(s*0.35,-s*0.08,s*0.015,0,Math.PI*2);c.fill();
    // Kulaklar
    c.fillStyle='#f5f5f5';c.beginPath();c.ellipse(s*0.24,-s*0.14,s*0.03,s*0.05,.5,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(s*0.36,-s*0.14,s*0.03,s*0.05,-.5,0,Math.PI*2);c.fill();
    // Boynuzlar
    c.fillStyle='#8d6e63';c.fillRect(s*0.24,-s*0.2,2,s*0.06);c.fillRect(s*0.34,-s*0.2,2,s*0.06);
    // Bacaklar
    c.fillStyle='#f5f5f5';c.fillRect(-s*0.15,s*0.14,3,s*0.12);c.fillRect(-s*0.05,s*0.14,3,s*0.12);
    c.fillRect(s*0.05,s*0.14,3,s*0.12);c.fillRect(s*0.15,s*0.14,3,s*0.12);
    // Kuyruk
    c.fillStyle='#f5f5f5';c.beginPath();c.moveTo(-s*0.3,s*0);c.quadraticCurveTo(-s*0.42,s*0.08,-s*0.38,s*0.15);c.lineWidth=2;c.strokeStyle='#f5f5f5';c.stroke();
  }else if(type==='KOYUN'){
    // Yandan gorunum - tuylu toplar
    c.fillStyle='#f5f5f5';c.beginPath();c.arc(0,0,s*0.22,0,Math.PI*2);c.fill();
    for(let i=0;i<6;i++){let a=i*Math.PI/3;c.beginPath();c.arc(Math.cos(a)*s*0.12,Math.sin(a)*s*0.1,s*0.1,0,Math.PI*2);c.fill()}
    // Bas
    c.fillStyle='#8d6e63';c.beginPath();c.ellipse(s*0.22,-s*0.02,s*0.08,s*0.06,0,0,Math.PI*2);c.fill();
    // Goz
    c.fillStyle='#000';c.beginPath();c.arc(s*0.26,-s*0.04,s*0.012,0,Math.PI*2);c.fill();
    // Kulak
    c.fillStyle='#a1887f';c.beginPath();c.ellipse(s*0.18,-s*0.08,s*0.02,s*0.04,.5,0,Math.PI*2);c.fill();
    // Bacaklar
    c.fillStyle='#8d6e63';c.fillRect(-s*0.08,s*0.16,2,s*0.1);c.fillRect(s*0.0,s*0.16,2,s*0.1);
    c.fillRect(s*0.08,s*0.16,2,s*0.1);
  }
  c.restore();
},

drawMiniProduct(c,type,s){
  c.save();c.translate(s/2,s/2);
  if(type==='SUT'){
    c.fillStyle='#f5f5dc';c.fillRect(-s*0.15,-s*0.25,s*0.3,s*0.5);
    c.fillStyle='#e8e0d0';c.fillRect(-s*0.15,-s*0.25,s*0.3,s*0.08);
    c.fillStyle='#29b6f6';c.fillRect(-s*0.1,-s*0.12,s*0.2,s*0.3);
  }else if(type==='YUMURTA'){
    c.fillStyle='#f5f0e0';c.beginPath();c.ellipse(-s*0.08,0,s*0.08,s*0.1,.1,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(s*0.08,0,s*0.08,s*0.1,-.1,0,Math.PI*2);c.fill();
  }else if(type==='YUN'){
    c.fillStyle='#f5f5f5';c.beginPath();c.arc(0,0,s*0.2,0,Math.PI*2);c.fill();
    c.fillStyle='#e0e0e0';c.beginPath();c.arc(-s*0.05,0,s*0.12,0,Math.PI*2);c.fill();
  }else if(type==='UN'){
    c.fillStyle='#f5f0dc';c.beginPath();c.arc(0,0,s*0.18,0,Math.PI*2);c.fill();
    c.fillStyle='#e8dcc8';c.beginPath();c.arc(0,s*0.02,s*0.12,0,Math.PI*2);c.fill();
    c.fillStyle='#d4c8a8';c.fillRect(-s*0.05,-s*0.05,s*0.1,s*0.08);
  }else if(type==='EKMEK'){
    c.fillStyle='#c68f00';c.beginPath();c.ellipse(0,0,s*0.2,s*0.12,0,0,Math.PI*2);c.fill();
    c.fillStyle='#d4a017';c.beginPath();c.ellipse(0,-s*0.03,s*0.18,s*0.08,0,0,Math.PI*2);c.fill();
    c.fillStyle='#e8c040';c.beginPath();c.arc(-s*0.06,-s*0.04,s*0.03,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(s*0.06,-s*0.04,s*0.03,0,Math.PI*2);c.fill();
  }else{
    let cols=GameManager.CROPS[type];
    if(cols){Drawing.drawMiniCrop(c,type,s)}else{
      c.fillStyle='#8d6e63';c.beginPath();c.arc(0,0,s*0.2,0,Math.PI*2);c.fill();
    }
  }
  c.restore();
},

drawRoadTesisToCanvas(c,s){
  c.save();c.translate(s/2,s/2+5);
  c.fillStyle='#795548';c.fillRect(-30,14,60,6);
  c.fillStyle='#5d4037';c.fillRect(-24,-4,48,20);
  c.fillStyle='#4e342e';c.fillRect(-26,-6,52,4);
  c.strokeStyle='rgba(0,0,0,0.12)';c.lineWidth=0.5;
  for(let r=0;r<2;r++)for(let col=0;col<4;col++){let off=(r%2)*6;c.strokeRect(-24+col*12+off,-4+r*10,12,10)}
  c.fillStyle='#3e2723';c.fillRect(-4,6,8,10);
  c.fillStyle='#5d4037';c.fillRect(-3,7,6,9);
  c.fillStyle='#616161';c.fillRect(-22,-10,8,6);
  c.fillStyle='#757575';c.beginPath();c.arc(-18,-7,3,0,Math.PI*2);c.fill();
  c.fillStyle='#8d6e63';c.fillRect(10,10,12,8);
  c.fillStyle='#a1887f';c.fillRect(11,11,10,3);
  c.fillStyle='#8d6e63';c.fillRect(14,6,4,4);
  c.fillStyle='#616161';c.fillRect(16,-4,3,12);
  c.fillStyle='#90a4ae';c.beginPath();c.arc(17,-6,3,0,Math.PI*2);c.fill();
  c.fillStyle='#fff';c.font='bold 5px "Nunito",Arial,sans-serif';c.textAlign='center';c.fillText('YOL',0,2);
  c.restore();
},

};
export default Drawing;
