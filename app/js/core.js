import StorageManager from './storageManager.js?v=1.046';
import UIManager from './uiManager.js?v=1.046';
import GameManager from './gameManager.js?v=1.046';
import Drawing from './drawing.js?v=1.046';

const ROWS=5,COLS=10;
const CF='"Nunito","Segoe UI",Arial,"Nunito",Arial,sans-serif';
const GRID_LINKED_KUYU=true;

let W,H,DPR,isMobile;
let GX,GY,CL,GRID_CL,sceneTop,ISLANDSCAPE;
let barnX=0,barnY=0,barnS=0;
let kümesX=0,kümesY=0,kümesS=0;
let wellX=0,wellY=0,wellS=0;
let wmX=0,wmY=0,wmS=0;
let firinX=0,firinY=0,firinS=0;
let sutIslemX=0,sutIslemY=0,sutIslemS=0;
let peynirX=0,peynirY=0,peynirS=0;
let salcaX=0,salcaY=0,salcaS=0;
let sutCount=0,yumurtaCount=0;
let rainDrops=[],snowFlakes=[];
let lampPositions=[];
let zoomLevel=1,zoomTarget=1,zoomCX=W/2,zoomCY=H/2;
let panX=0,panY=0,isPanning=false,wasPanning=false;
let panStartX=0,panStartY=0,panStartPX=0,panStartPY=0;
let pinchDist0=0,pinchZoom0=1;
let frameCount=0,windmillAngle=0,lastFrameTime=Date.now();
let CV,X;
let plantMode=null;
let harvestModeActive=false;
let pesticideModeActive=false;
let lastPlantClick=-1;
let selR=-1,selC=-1;

const S=GameManager.S;

function getDaylight(){
  let t=S.h+S.m/60;
  if(t>=5&&t<7)return(t-5)/2;
  if(t>=7&&t<17)return 1;
  if(t>=17&&t<20)return 1-(t-17)/3;
  return 0;
}

function screenToScene(sx,sy){return{x:(sx-panX-zoomCX)/zoomLevel+zoomCX,y:(sy-panY-zoomCY)/zoomLevel+zoomCY}}
function sceneToScreen(sx,sy){return{x:(sx-zoomCX)*zoomLevel+zoomCX+panX,y:(sy-zoomCY)*zoomLevel+zoomCY+panY}}

function resize(){
  W=window.innerWidth;H=window.innerHeight;
  isMobile=(/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))||window.innerWidth<768;
  DPR=Math.min(window.devicePixelRatio||1,isMobile?2:3);
  CV.width=W*DPR;CV.height=H*DPR;
  CV.style.width=W+'px';CV.style.height=H+'px';
  X.setTransform(DPR,0,0,DPR,0,0);
}

function calcLayout(){
  let toolbarH=48,hudH=38;
  ISLANDSCAPE=W>H;
  let areaH=H-hudH-toolbarH-4;
  let areaW=W-8;
  if(ISLANDSCAPE){
    CL=Math.min(Math.floor(areaW/17),Math.floor(areaH/9),40);
    GRID_CL=W<800?Math.floor(CL*0.6):CL;
    sceneTop=hudH+Math.floor(areaH*0.16);
    GX=(W-COLS*GRID_CL)/2;GY=hudH+Math.floor(areaH*0.28);
  }else{
    let pad=Math.floor(W*0.22);
    CL=Math.min(Math.floor((areaW-pad*2)/COLS),Math.floor(areaH/13),34);
    GRID_CL=Math.floor(CL*0.6);
    sceneTop=hudH+Math.floor(areaH*0.06);
    GX=pad+Math.floor((areaW-pad*2-COLS*GRID_CL)/2);GY=hudH+Math.floor(areaH*0.40);
  }
}

function drawBuildingMenu(){
  if(!S.buildingMenu)return;
  let m=S.buildingMenu;
  let bx=m.x-60,by=m.y-90;
  if(bx<10)bx=10;if(bx+120>W-10)bx=W-130;
  if(by<10)by=m.y+10;
  X.fillStyle='rgba(22,18,15,0.95)';
  X.strokeStyle='#5a5550';X.lineWidth=2;
  X.beginPath();X.roundRect(bx,by,120,80,8);X.fill();X.stroke();
  X.fillStyle='#c8b888';X.font='bold 11px "Nunito",Arial,sans-serif';X.textAlign='center';
  X.fillText(GameManager.BUILDING_NAMES[m.key],bx+60,by+16);
  let items=[
    {text:'📍 Kaydır',y:by+30,action:'drag'},
    {text:'🗑 Kaldır ('+Math.floor((GameManager.BUILDING_PRICES[m.key]||0)*GameManager.SELL_RATIO)+' TL)',y:by+50,action:'sell'},
    {text:'✖ İptal',y:by+70,action:'cancel'}
  ];
  items.forEach(it=>{
    X.fillStyle='#d7ccc8';X.font='11px "Nunito",Arial,sans-serif';X.textAlign='center';
    X.fillText(it.text,bx+60,it.y+3);
  });
  S.buildingMenu.items=items;
}

function syncFromWindow(){
  zoomTarget=window.zoomTarget;zoomCX=window.zoomCX;zoomCY=window.zoomCY;
  panX=window.panX;panY=window.panY;
  if(window.W)W=window.W;if(window.H)H=window.H;
}
function draw(){
  syncFromWindow();
  if(!X){return;}
  X.clearRect(0,0,W,H);
  calcLayout();
  window.W=W;window.H=H;window.CL=CL;window.GRID_CL=GRID_CL;window.GX=GX;window.GY=GY;window.sceneTop=sceneTop;window.ISLANDSCAPE=ISLANDSCAPE;
  zoomLevel+=(zoomTarget-zoomLevel)*0.15;
  if(Math.abs(zoomTarget-zoomLevel)<0.005)zoomLevel=zoomTarget;
  if(S.buildingPos.grid){
    let off=S.buildingPos.grid;
    GX=off.x;GY=off.y;
  }
  frameCount++;
  let bgDl=getDaylight();
  let skyH=sceneTop-5;
  let bgG=X.createLinearGradient(0,0,0,H);
  if(S.weather==='yağmurlu'){
    bgG.addColorStop(0,`rgba(55,60,70,${0.4+bgDl*0.6})`);bgG.addColorStop(0.15,`rgba(78,82,78,${0.4+bgDl*0.6})`);
  }else if(S.weather==='karlı'){
    bgG.addColorStop(0,`rgba(80,85,95,${0.3+bgDl*0.7})`);bgG.addColorStop(0.15,`rgba(108,110,112,${0.3+bgDl*0.7})`);
  }else if(S.weather==='bulutlu'){
    bgG.addColorStop(0,`rgba(65,75,88,${0.5+bgDl*0.5})`);bgG.addColorStop(0.15,`rgba(88,92,85,${0.5+bgDl*0.5})`);
  }else{
    bgG.addColorStop(0,`rgba(50,70,100,${0.3+bgDl*0.7})`);
    bgG.addColorStop(0.12,`rgba(70,90,115,${0.3+bgDl*0.7})`);
    bgG.addColorStop(0.2,`rgba(90,98,80,${0.3+bgDl*0.7})`);
    bgG.addColorStop(0.25,`rgba(98,100,72,${0.3+bgDl*0.7})`);
  }
  bgG.addColorStop(0.3,'#3a4428');bgG.addColorStop(1,'#222a14');
  X.fillStyle=bgG;X.fillRect(0,0,W,H);

  X.save();
  X.translate(panX,panY);X.translate(zoomCX,zoomCY);X.scale(zoomLevel,zoomLevel);X.translate(-zoomCX,-zoomCY);

  Drawing.drawSky();
  Drawing.drawMountains();
  Drawing.drawGrassBackground();

  let gridCX=GX+COLS*GRID_CL/2;
  let gridCY=GY+ROWS*GRID_CL/2;
  let gridBottom=GY+ROWS*GRID_CL;
  let gridRight=GX+COLS*GRID_CL;

  let houseScale=ISLANDSCAPE?2.8:2.0;
  let houseS=CL*houseScale;
  let houseGap=CL*1.2;
  let houseX=Math.min(GX-houseGap, W*0.16+houseS);
  houseX=Math.max(houseS+CL*0.3, houseX);
  let houseY=sceneTop+Math.floor((GY-sceneTop)*0.05);
  window.houseX=houseX;window.houseY=houseY;window.houseS=houseS;

  Drawing.drawRoads(houseX,houseY,gridCX,gridCY,gridRight,gridBottom,houseS);
  Drawing.drawHouse(houseX,houseY,houseS);

  if(S.built.grid){
    let fPad=GRID_CL*0.3;
    Drawing.drawFenceSegment(GX-fPad,GY-fPad,gridRight+fPad,GY-fPad);
    Drawing.drawFenceSegment(gridRight+fPad,GY-fPad,gridRight+fPad,gridBottom+fPad);
    Drawing.drawFenceSegment(gridRight+fPad,gridBottom+fPad,GX-fPad,gridBottom+fPad);
    Drawing.drawFenceSegment(GX-fPad,gridBottom+fPad,GX-fPad,GY-fPad);
  }

  let floorY=H-48;
  let rightW=W-gridRight;
  let rAvailH=floorY-sceneTop;
  let useTwoCols=rightW>CL*5.5;
  let rCol1X,rCol2X,rRow1Y,rRow2Y,rRow3Y,rRowH;

  if(useTwoCols){
    rCol1X=gridRight+CL*3.0;
    rCol2X=W-CL*2.0;
    rRowH=rAvailH/3.0;
    rRow1Y=sceneTop+CL*0.5;
    rRow2Y=rRow1Y+rRowH;
    rRow3Y=rRow2Y+rRowH;
  }else{
    rCol1X=gridRight+CL*0.5;
    rCol2X=rCol1X;
    rRowH=rAvailH/3.2;
    rRow1Y=sceneTop+CL*0.2;
    rRow2Y=rRow1Y+rRowH;
    rRow3Y=rRow2Y+rRowH;
  }

  let rBottomLeftX,rBottomRightX,rBottomY;
  if(useTwoCols){
    rBottomLeftX=GX-CL*1.0;
    rBottomRightX=GX+CL*3.0;
    rBottomY=gridBottom+CL*2.0;
    if(rBottomY>floorY-CL*2.5)rBottomY=floorY-CL*2.5;
  }

  let bScale=useTwoCols?1:0.75;
  barnS=CL*2.5*bScale;
  if(S.buildingPos.ahır){
    barnX=S.buildingPos.ahır.x;barnY=S.buildingPos.ahır.y;
  }else{
    barnX=rCol2X;barnY=rRow1Y;
  }
  window.barnX=barnX;window.barnY=barnY;window.barnS=barnS;
  if(S.built.ahır){
    Drawing.drawBarn(barnX,barnY,barnS);
  }

  kümesS=CL*2.0*bScale;
  if(S.buildingPos.kümes){
    kümesX=S.buildingPos.kümes.x;kümesY=S.buildingPos.kümes.y;
  }else{
    kümesX=rCol1X;kümesY=rRow1Y;
  }
  window.kümesX=kümesX;window.kümesY=kümesY;window.kümesS=kümesS;
  if(S.built.kümes){
    Drawing.drawKümes(kümesX,kümesY,kümesS);
  }

  let kFfX=kümesX-kümesS*0.7,kFfY=kümesY+kümesS*0.75;
  let kFfW=kümesS*1.4,kFfH=kümesS*0.6;
  if(S.built.kümes){
    Drawing.drawFenceSegment(kFfX,kFfY,kFfX+kFfW,kFfY);
    Drawing.drawFenceSegment(kFfX+kFfW,kFfY,kFfX+kFfW,kFfY+kFfH);
    Drawing.drawFenceSegment(kFfX+kFfW,kFfY+kFfH,kFfX,kFfY+kFfH);
    Drawing.drawFenceSegment(kFfX,kFfY+kFfH,kFfX,kFfY);
  }

  let fYX=barnX-barnS*0.5,fYY=barnY+barnS*0.85;
  let fYW=barnS*1.2,fYH=barnS*0.6;
  if(S.built.ahır){
    Drawing.drawFenceSegment(fYX,fYY,fYX+fYW,fYY);
    Drawing.drawFenceSegment(fYX+fYW,fYY,fYX+fYW,fYY+fYH);
    Drawing.drawFenceSegment(fYX+fYW,fYY+fYH,fYX,fYY+fYH);
    Drawing.drawFenceSegment(fYX,fYY+fYH,fYX,fYY);
  }

  if(S.built.ahır){
    for(let i=0;i<Math.min(S.co,3);i++){
      let cx=fYX+fYW*0.2+i*fYW*0.25;
      let cy=fYY+fYH*0.35+Math.sin(Date.now()/1500+i)*CL*0.08*bScale;
      Drawing.drawCow(cx,cy,CL*1.1*bScale,i%2===0);
    }
    for(let i=0;i<Math.min(S.sh,3);i++){
      let cx=fYX+fYW*0.15+i*fYW*0.2;
      let cy=fYY+fYH*0.65+Math.sin(Date.now()/1800+i*2)*CL*0.05*bScale;
      Drawing.drawSheep(cx,cy,CL*0.6*bScale,i%2===0);
    }
  }
  if(S.built.kümes){
    for(let i=0;i<Math.min(S.ch,6);i++){
      let cx=kFfX+kFfW*0.15+i*kFfW*0.14;
      let cy=kFfY+kFfH*0.4+Math.sin(Date.now()/800+i*1.5)*CL*0.05*bScale;
      Drawing.drawChicken(cx,cy,CL*0.42*bScale,i%2===0,i%3);
    }
  }

  let dogX=GX-CL*0.6,dogY=gridCY;
  let tDog=Date.now()/2000;
  X.fillStyle='rgba(0,0,0,0.1)';X.beginPath();X.ellipse(dogX,dogY+CL*0.1,CL*0.18,CL*0.04,0,0,Math.PI*2);X.fill();
  X.strokeStyle='#8d6e63';X.lineWidth=2.5;
  X.beginPath();X.moveTo(dogX-CL*0.15,dogY);
  X.quadraticCurveTo(dogX-CL*0.22,dogY-CL*0.1+Math.sin(tDog)*CL*0.05,dogX-CL*0.18,dogY-CL*0.15);
  X.stroke();
  X.fillStyle='#8d6e63';X.beginPath();X.ellipse(dogX,dogY,CL*0.18,CL*0.09,0,0,Math.PI*2);X.fill();
  X.fillStyle='#a1887f';X.beginPath();X.ellipse(dogX,dogY+CL*0.03,CL*0.12,CL*0.05,0,0,Math.PI*2);X.fill();
  X.fillStyle='#6d4c41';
  X.fillRect(dogX-CL*0.1,dogY+CL*0.06,2,CL*0.08);
  X.fillRect(dogX+CL*0.05,dogY+CL*0.06,2,CL*0.08);
  X.fillStyle='#8d6e63';X.beginPath();X.arc(dogX+CL*0.15,dogY-CL*0.05,CL*0.08,0,Math.PI*2);X.fill();
  X.fillStyle='#6d4c41';
  X.beginPath();X.ellipse(dogX+CL*0.1,dogY-CL*0.02,CL*0.03,CL*0.06,.3,0,Math.PI*2);X.fill();
  X.fillStyle='#fff';X.beginPath();X.arc(dogX+CL*0.18,dogY-CL*0.06,CL*0.025,0,Math.PI*2);X.fill();
  X.fillStyle='#000';X.beginPath();X.arc(dogX+CL*0.19,dogY-CL*0.06,CL*0.012,0,Math.PI*2);X.fill();
  X.fillStyle='#2d2d2d';X.beginPath();X.arc(dogX+CL*0.22,dogY-CL*0.04,CL*0.015,0,Math.PI*2);X.fill();
  X.fillStyle='#e57373';X.beginPath();X.ellipse(dogX+CL*0.2,dogY-CL*0.01,CL*0.01,CL*0.02,.2,0,Math.PI*2);X.fill();

  wellS=CL*2.1*bScale;
  if(S.buildingPos.kuyu){
    wellX=S.buildingPos.kuyu.x;wellY=S.buildingPos.kuyu.y;
  }else if(S.built.grid){
    wellX=gridCX;
    let maxWellY=floorY-CL*1.2;
    wellY=Math.min(gridBottom+CL*1.5,maxWellY);
  }else{
    wellX=W*0.5;wellY=GY+CL*3;
  }
  window.wellX=wellX;window.wellY=wellY;window.wellS=wellS;
  if(S.built.kuyu){
    Drawing.drawWell(wellX,wellY,wellS);
  }

  wmS=houseS*0.8;
  if(S.buildingPos.degirmen){
    wmX=S.buildingPos.degirmen.x;wmY=S.buildingPos.degirmen.y;
  }else{
    wmX=houseX-houseS*0.2;wmY=houseY+houseS*1.5;
  }
  window.wmX=wmX;window.wmY=wmY;window.wmS=wmS;
  if(S.built.degirmen){
    Drawing.drawWindmill(wmX,wmY,wmS);
  }

  firinS=CL*(ISLANDSCAPE?2.0:1.6)*bScale;
  if(S.buildingPos.fırın){
    firinX=S.buildingPos.fırın.x;firinY=S.buildingPos.fırın.y;
  }else{
    firinX=rCol2X;firinY=rRow2Y;
  }
  window.firinX=firinX;window.firinY=firinY;window.firinS=firinS;
  if(S.built.fırın){
    Drawing.drawFırın(firinX,firinY,firinS);
  }

  sutIslemS=CL*(ISLANDSCAPE?1.8:1.4)*bScale;
  if(S.buildingPos.sutislem){sutIslemX=S.buildingPos.sutislem.x;sutIslemY=S.buildingPos.sutislem.y}
  else{sutIslemX=rCol1X;sutIslemY=rRow2Y}
  window.sutIslemX=sutIslemX;window.sutIslemY=sutIslemY;window.sutIslemS=sutIslemS;
  if(S.built.sutislem){Drawing.drawSutIslem(sutIslemX,sutIslemY,sutIslemS)}

  peynirS=CL*(ISLANDSCAPE?1.8:1.4)*bScale;
  if(S.buildingPos.peynirfab){peynirX=S.buildingPos.peynirfab.x;peynirY=S.buildingPos.peynirfab.y}
  else{peynirX=useTwoCols?rBottomRightX:rCol2X;peynirY=useTwoCols?rBottomY:rRow3Y}
  window.peynirX=peynirX;window.peynirY=peynirY;window.peynirS=peynirS;
  if(S.built.peynirfab){Drawing.drawPeynirFab(peynirX,peynirY,peynirS)}

  salcaS=CL*(ISLANDSCAPE?1.8:1.4)*bScale;
  if(S.buildingPos.salçafab){salcaX=S.buildingPos.salçafab.x;salcaY=S.buildingPos.salçafab.y}
  else{salcaX=useTwoCols?rBottomLeftX:rCol1X;salcaY=useTwoCols?rBottomY:rRow3Y}
  window.salcaX=salcaX;window.salcaY=salcaY;window.salcaS=salcaS;
  if(S.built.salçafab){Drawing.drawSalcaFab(salcaX,salcaY,salcaS)}

  let forestTop=H-48-CL*0.3;
  let g2=X.createLinearGradient(0,forestTop,0,H-48);
  g2.addColorStop(0,'#2a4020');g2.addColorStop(1,'#1a3018');
  X.fillStyle=g2;X.fillRect(0,forestTop,W,H-48-forestTop);

  X.strokeStyle='#3a5028';X.lineWidth=2;
  X.beginPath();X.moveTo(0,forestTop);X.lineTo(W,forestTop);X.stroke();

  let fenceY2=forestTop-CL*0.15;
  Drawing.drawFenceSegment(0,fenceY2,W*0.3,fenceY2);
  Drawing.drawFenceSegment(W*0.38,fenceY2,W*0.62,fenceY2);
  Drawing.drawFenceSegment(W*0.7,fenceY2,W,fenceY2);

if(S.built.grid){
  X.fillStyle='#2a2a28';
  X.fillRect(GX-5,GY-5,COLS*GRID_CL+10,ROWS*GRID_CL+10);
  X.fillStyle='#343430';
  X.fillRect(GX-3,GY-3,COLS*GRID_CL+6,ROWS*GRID_CL+6);
  X.fillStyle='#1e1e1c';X.fillRect(GX,GY,COLS*GRID_CL,ROWS*GRID_CL);

  let t=Date.now();
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      let x=GX+c*GRID_CL,y=GY+r*GRID_CL;
      let p=GameManager.getP(r,c);
      let plowed=S.plowed.includes(r*COLS+c);
      if(!plowed){
        X.fillStyle='#2a3218';X.fillRect(x,y,GRID_CL-1,GRID_CL-1);
        if((r+c)%3===0){X.fillStyle='rgba(30,50,18,0.4)';X.fillRect(x+2,y+2,GRID_CL-5,GRID_CL-5)}
      }else if(!p.crop){
        let wetSoil=p.w;
        X.fillStyle=wetSoil?'#1e1a15':'#3a3530';X.fillRect(x,y,GRID_CL-1,GRID_CL-1);
        X.fillStyle=wetSoil?'rgba(15,10,8,0.3)':'rgba(50,45,40,0.3)';X.fillRect(x+1,y+1,GRID_CL-3,GRID_CL-3);
        for(let i=1;i<3;i++){X.strokeStyle=wetSoil?'rgba(30,20,15,0.3)':'rgba(60,50,40,0.3)';X.lineWidth=0.5;X.beginPath();X.moveTo(x+3,y+i*GRID_CL/3);X.lineTo(x+GRID_CL-4,y+i*GRID_CL/3);X.stroke()}
      }else{
        X.fillStyle=p.w?'#1a1510':'#2a2520';X.fillRect(x,y,GRID_CL-1,GRID_CL-1);
        let cr=GameManager.CROPS[p.crop];
        if(cr){
          let age=p.age/365;let g=Math.min(1,age/cr.my);
          if(p.nextHarvest<=0){
            Drawing.drawHarvestProduct(x+GRID_CL/2,y+GRID_CL/2,GRID_CL*0.85,p.crop,cr);
          }else{
            Drawing.drawCropSprite(x+GRID_CL/2,y+GRID_CL*0.75,GRID_CL*0.7,p.crop,g,cr);
          }
        }
        if(p.nextHarvest<=0&&cr){
          Drawing.drawCropSprite(x+GRID_CL/2,y+GRID_CL/2,GRID_CL*0.9,p.crop,1,cr);
          X.save();
          X.shadowColor='#ffd700';X.shadowBlur=8;
          X.strokeStyle='#ffd700';X.lineWidth=2.5;
          X.beginPath();X.roundRect(x+1,y+1,GRID_CL-2,GRID_CL-2,3);X.stroke();
          X.restore();
          X.strokeStyle='rgba(255,215,0,0.2)';X.lineWidth=4;
          X.beginPath();X.roundRect(x-0.5,y-0.5,GRID_CL,GRID_CL,4);X.stroke();
        }
      }
      if(S.sel===r*COLS+c){X.strokeStyle='#c8b888';X.lineWidth=2;X.strokeRect(x+1,y+1,GRID_CL-2,GRID_CL-2)}
      if(p.crop&&!p.p){
        let t=Date.now()/1000;
        let seed=p.r*17+p.c*31;
        let bugCount=1+(seed%4);
        let types=['fly','beetle','caterpillar','ant'];
        for(let i=0;i<bugCount;i++){
          let s2=seed+i*37;
          let tx=Math.sin(s2)*0.3+0.5;
          let ty=Math.cos(s2*2)*0.3+0.5;
          let bx=x+CL*tx+Math.sin(s2+t*1.2+i)*CL*0.12;
          let by=y+CL*ty+Math.cos(s2+t*0.9+i)*CL*0.1;
          let tp=types[s2%types.length];
          if(tp==='fly'){
            X.fillStyle='#2d2d2d';X.beginPath();X.ellipse(bx,by,CL*0.04,CL*0.03,0,0,Math.PI*2);X.fill();
            X.strokeStyle='rgba(80,80,80,0.5)';X.lineWidth=0.5;
            X.beginPath();X.moveTo(bx-CL*0.02,by-CL*0.01);X.lineTo(bx-CL*0.06,by-CL*0.05);X.stroke();
            X.beginPath();X.moveTo(bx+CL*0.01,by-CL*0.01);X.lineTo(bx+CL*0.05,by-CL*0.04);X.stroke();
          }else if(tp==='beetle'){
            X.fillStyle='#5d4037';X.beginPath();X.ellipse(bx,by,CL*0.03,CL*0.025,0.3,0,Math.PI*2);X.fill();
            X.fillStyle='#3e2723';X.beginPath();X.arc(bx+CL*0.01,by-CL*0.005,CL*0.008,0,Math.PI*2);X.fill();
          }else if(tp==='caterpillar'){
            X.fillStyle='rgba(100,60,20,0.6)';
            for(let j=0;j<3;j++){X.beginPath();X.arc(bx+j*CL*0.02,by+Math.sin(t*3+j)*CL*0.01,CL*0.012,0,Math.PI*2);X.fill()}
          }else{
            X.fillStyle='#4a2800';X.beginPath();X.ellipse(bx,by,CL*0.02,CL*0.015,0.5,0,Math.PI*2);X.fill();
          }
        }
      }
    }
  }

  if(S.built.kuyu){
  let isIrrigating=S.irrigating;
  let pipeColor=isIrrigating?'#42a5f5':'#78909c';

  let sprinklerX=gridCX;
  let sprinklerY=GY+ROWS*GRID_CL*0.5;
  let pipeStartYW=wellY-wellS*0.35;

  X.strokeStyle='rgba(0,0,0,0.2)';X.lineWidth=6;
  X.beginPath();X.moveTo(wellX+1,pipeStartYW+1);X.lineTo(sprinklerX+1,sprinklerY+1);X.stroke();
  X.strokeStyle=pipeColor;X.lineWidth=4;
  X.beginPath();X.moveTo(wellX,pipeStartYW);X.lineTo(sprinklerX,sprinklerY);X.stroke();
  X.strokeStyle=isIrrigating?'rgba(100,181,246,0.5)':'rgba(200,210,220,0.4)';X.lineWidth=1;
  X.beginPath();X.moveTo(wellX-1,pipeStartYW-1);X.lineTo(sprinklerX-1,sprinklerY-1);X.stroke();

  if(isIrrigating){
    let t=Date.now()/500;
    let prog=(Math.sin(t)*0.5+0.5);
    let midX=wellX+(sprinklerX-wellX)*prog;
    let midY=pipeStartYW+(sprinklerY-pipeStartYW)*prog;
    X.strokeStyle='rgba(66,165,245,0.9)';X.lineWidth=2.5;
    X.beginPath();X.moveTo(wellX,pipeStartYW);X.lineTo(midX,midY);X.stroke();
  }

  X.strokeStyle=pipeColor;X.lineWidth=3;
  X.beginPath();X.moveTo(sprinklerX,sprinklerY);X.lineTo(sprinklerX,sprinklerY-10);X.stroke();
  X.fillStyle=isIrrigating?'#1565c0':'#455a64';
  X.beginPath();X.arc(sprinklerX,sprinklerY-11,5,0,Math.PI*2);X.fill();
  X.fillStyle=isIrrigating?'#42a5f5':'#607d8b';
  X.beginPath();X.arc(sprinklerX,sprinklerY-11,3.5,0,Math.PI*2);X.fill();
  X.strokeStyle=isIrrigating?'#90caf9':'#90a4ae';X.lineWidth=1;
  for(let a=0;a<6;a++){
    let ang=a*Math.PI/3;
    X.beginPath();
    X.moveTo(sprinklerX+Math.cos(ang)*4,sprinklerY-11+Math.sin(ang)*4);
    X.lineTo(sprinklerX+Math.cos(ang)*7,sprinklerY-11+Math.sin(ang)*7);
    X.stroke();
  }

  if(isIrrigating){
    let t=Date.now();
    let emitY=sprinklerY-11;
    for(let i=0;i<80;i++){
      let seed=i*137.508+t*0.003;
      let angle=(seed%(Math.PI*2));
      let maxDist=CL*3.5;
      let cycleT=(t*0.002+i*0.37)%2;
      let dist=maxDist*cycleT;
      let dx=sprinklerX+Math.cos(angle)*dist;
      let risePhase=Math.min(1,cycleT*2);
      let fallPhase=Math.max(0,cycleT-0.5)*2;
      let riseH=CL*1.2*risePhase*(1-fallPhase);
      let dropY=emitY-riseH+fallPhase*fallPhase*CL*1.5;
      let alpha=0.7*(1-Math.abs(cycleT-0.7));
      if(alpha>0.05&&dropY>=GY&&dropY<=GY+ROWS*GRID_CL&&dx>=GX&&dx<=GX+COLS*GRID_CL){
        X.strokeStyle=`rgba(100,181,246,${alpha})`;
        X.lineWidth=1.2;
        X.beginPath();X.moveTo(dx,dropY-3);X.lineTo(dx-0.5,dropY+3);X.stroke();
        X.fillStyle=`rgba(100,181,246,${alpha*0.8})`;
        X.beginPath();X.arc(dx,dropY+3,1,0,Math.PI*2);X.fill();
      }
    }
    for(let i=0;i<20;i++){
      let seed=i*97.31+t*0.004;
      let angle=(seed%(Math.PI*2));
      let ringDist=GRID_CL*0.8+((seed*3)%GRID_CL*2);
      let rdx=sprinklerX+Math.cos(angle)*ringDist;
      let rdy=sprinklerY+GRID_CL*0.3+Math.sin(angle*0.5)*GRID_CL*0.3;
      if(rdy>=GY&&rdy<=GY+ROWS*GRID_CL&&rdx>=GX&&rdx<=GX+COLS*GRID_CL){
        let ringPhase=(t*0.005+i*0.5)%1.5;
        if(ringPhase<1){
          let ringR=ringPhase*6;
          let ringA=0.3*(1-ringPhase);
          X.strokeStyle=`rgba(100,181,246,${ringA})`;X.lineWidth=0.8;
          X.beginPath();X.ellipse(rdx,rdy+CL*0.1,ringR,ringR*0.3,0,0,Math.PI*2);X.stroke();
        }
      }
    }
    let haloR=CL*2+Math.sin(t*0.001)*CL*0.2;
    let haloGrad=X.createRadialGradient(sprinklerX,emitY,0,sprinklerX,emitY,haloR);
    haloGrad.addColorStop(0,'rgba(66,165,245,0.12)');
    haloGrad.addColorStop(0.5,'rgba(66,165,245,0.04)');
    haloGrad.addColorStop(1,'rgba(66,165,245,0)');
    X.fillStyle=haloGrad;
    X.beginPath();X.arc(sprinklerX,emitY,haloR,0,Math.PI*2);X.fill();
  }
  }

}

  if(S.tractorActive){
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){X.fillStyle='rgba(255,255,255,0.05)';X.fillRect(GX+c*GRID_CL,GY+r*GRID_CL,GRID_CL-1,GRID_CL-1)}
    let tx=GX+COLS*GRID_CL/2,ty=GY+ROWS*GRID_CL/2;
    X.fillStyle='#1a1a1a';X.beginPath();X.arc(tx-12,ty+8,10,0,Math.PI*2);X.fill();
    X.fillStyle='#333';X.beginPath();X.arc(tx-12,ty+8,7,0,Math.PI*2);X.fill();
    X.fillStyle='#1a1a1a';X.beginPath();X.arc(tx+15,ty+10,6,0,Math.PI*2);X.fill();
    X.fillStyle='#e53935';X.fillRect(tx-18,ty-6,28,14);
    X.fillStyle='#c62828';X.fillRect(tx-16,ty-12,16,8);
    X.fillStyle='#64b5f6';X.fillRect(tx-14,ty-10,8,5);
    X.fillStyle='rgba(255,255,255,0.8)';X.font='bold 12px "Nunito",Arial,sans-serif';X.textAlign='center';
    X.fillText('Tıkla ve sür!',tx,ty+25);
  }

  let dl=getDaylight();
  let isNight=dl<0.4;
  let gridCY2=GY+ROWS*GRID_CL/2;
  let gridBottom2=GY+ROWS*GRID_CL;
  let gridCX2=GX+COLS*GRID_CL/2;
  lampPositions=[
    {x:houseX-houseS*0.9,y:houseY+houseS*0.8,tip:'guzel'},
    {x:houseX+houseS*0.9,y:houseY+houseS*0.8,tip:'guzel'},
    {x:GX-CL*0.6,y:GY-CL*0.3,tip:'basit'},
    {x:GX+COLS*GRID_CL+CL*0.6,y:GY-CL*0.3,tip:'basit'},
    {x:GX-CL*0.6,y:GY+ROWS*GRID_CL*0.5,tip:'basit'},
    {x:GX+COLS*GRID_CL+CL*0.6,y:GY+ROWS*GRID_CL*0.5,tip:'basit'},
    {x:GX-CL*0.6,y:gridBottom2+CL*0.3,tip:'basit'},
    {x:GX+COLS*GRID_CL+CL*0.6,y:gridBottom2+CL*0.3,tip:'basit'},
    {x:barnX-barnS*0.5,y:barnY+barnS*0.7,tip:'guzel'},
    {x:kümesX-kümesS*0.5,y:kümesY+kümesS*0.7,tip:'guzel'}
  ];
  lampPositions.forEach(lp=>{
    let poleH=lp.tip==='basit'?CL*0.8:CL*1.1;
    let baseY=lp.y;
    let topY=baseY-poleH;
    let cx=lp.x;
    X.fillStyle='rgba(0,0,0,0.15)';X.beginPath();X.ellipse(cx,baseY+2,lp.tip==='basit'?5:8,2,0,0,Math.PI*2);X.fill();
    if(lp.tip==='basit'){
      X.fillStyle='#607d8b';X.fillRect(cx-1.5,baseY-poleH,3,poleH);
      X.fillStyle='#455a64';X.fillRect(cx-3,baseY-2,6,4);
      X.fillStyle='#37474f';
      X.beginPath();X.moveTo(cx-4,topY+2);X.lineTo(cx+4,topY+2);
      X.lineTo(cx+3,topY-5);X.lineTo(cx-3,topY-5);X.closePath();X.fill();
      X.fillStyle='rgba(200,220,240,0.4)';X.fillRect(cx-2,topY-3,4,4);
      if(isNight){
        let grd=X.createRadialGradient(cx,topY-1,0,cx,topY-1,CL*0.5);
        grd.addColorStop(0,'rgba(255,220,100,0.3)');grd.addColorStop(1,'rgba(255,180,50,0)');
        X.fillStyle=grd;X.beginPath();X.arc(cx,topY-1,CL*0.5,0,Math.PI*2);X.fill();
        X.fillStyle='rgba(255,230,120,0.9)';X.beginPath();X.arc(cx,topY-1,2,0,Math.PI*2);X.fill();
      }else{
        X.fillStyle='#bbb';X.beginPath();X.arc(cx,topY-1,1.5,0,Math.PI*2);X.fill();
      }
    }else{
      X.fillStyle='#37474f';
      X.beginPath();X.moveTo(cx-7,baseY);X.lineTo(cx+7,baseY);X.lineTo(cx+5,baseY-8);X.lineTo(cx-5,baseY-8);X.closePath();X.fill();
      X.fillStyle='#455a64';X.fillRect(cx-2.5,baseY-poleH+10,5,poleH-18);
      X.strokeStyle='#546e7a';X.lineWidth=1;
      for(let i=0;i<Math.floor(poleH/8);i++){let sy=baseY-12-i*8;X.beginPath();X.arc(cx,sy,3,0,Math.PI);X.stroke()}
      X.fillStyle='#37474f';X.beginPath();X.ellipse(cx,topY+12,6,4,0,0,Math.PI*2);X.fill();
      X.fillStyle='#455a64';X.fillRect(cx-2,topY+6,4,10);
      X.strokeStyle='#546e7a';X.lineWidth=2.5;
      X.beginPath();X.moveTo(cx,topY+10);X.quadraticCurveTo(cx-CL*0.2,topY+5,cx-CL*0.22,topY+18);X.stroke();
      X.beginPath();X.moveTo(cx,topY+10);X.quadraticCurveTo(cx+CL*0.2,topY+5,cx+CL*0.22,topY+18);X.stroke();
      X.beginPath();X.moveTo(cx,topY+6);X.lineTo(cx,topY);X.stroke();
      let fenerler=[{x:cx-CL*0.22,y:topY+18},{x:cx,y:topY},{x:cx+CL*0.22,y:topY+18}];
      fenerler.forEach(f=>{
        X.fillStyle='#37474f';
        X.beginPath();X.moveTo(f.x-5,f.y+2);X.lineTo(f.x+5,f.y+2);X.lineTo(f.x+4,f.y-8);X.lineTo(f.x-4,f.y-8);X.closePath();X.fill();
        X.fillStyle=isNight?'rgba(255,230,130,0.7)':'rgba(180,200,220,0.5)';
        X.fillRect(f.x-3,f.y-6,6,7);
        X.fillStyle='#263238';X.beginPath();X.moveTo(f.x-6,f.y+2);X.lineTo(f.x+6,f.y+2);X.lineTo(f.x+4,f.y+4);X.lineTo(f.x-4,f.y+4);X.closePath();X.fill();
        X.fillStyle='#37474f';X.beginPath();X.moveTo(f.x-5,f.y-8);X.lineTo(f.x+5,f.y-8);X.lineTo(f.x+2,f.y-12);X.lineTo(f.x-2,f.y-12);X.closePath();X.fill();
        X.beginPath();X.arc(f.x,f.y-12,2,0,Math.PI*2);X.fill();
      });
      if(isNight){
        fenerler.forEach(f=>{
          let glowR=CL*0.7;
          let grd=X.createRadialGradient(f.x,f.y-2,0,f.x,f.y-2,glowR);
          grd.addColorStop(0,'rgba(255,220,100,0.35)');grd.addColorStop(0.3,'rgba(255,200,80,0.15)');
          grd.addColorStop(0.7,'rgba(255,180,50,0.03)');grd.addColorStop(1,'rgba(255,180,50,0)');
          X.fillStyle=grd;X.beginPath();X.arc(f.x,f.y-2,glowR,0,Math.PI*2);X.fill();
          X.fillStyle='rgba(255,230,120,0.95)';X.beginPath();X.arc(f.x,f.y-2,2.5,0,Math.PI*2);X.fill();
        });
      }
    }
  });

  X.fillStyle='rgba(0,0,0,0.5)';
  X.fillRect(8,H-42,W-16,36);X.strokeStyle='#5a5550';X.lineWidth=1;X.strokeRect(8,H-42,W-16,36);
  X.fillStyle='#c8b888';X.font='11px "Nunito",Arial,sans-serif';X.textAlign='left';
  X.fillText('EV: Dinlen | MAGAZA: Alışveriş | HAYVAN: Bakım | DEPO: Ürünler | Traktör: Sur',16,H-22);

    if(S.dragging){
    let dx=S.dragX,dy=S.dragY;
    let valid=GameManager.isValidPlacement(S.dragging,dx,dy);
    X.globalAlpha=0.5;
    if(S.dragging==='grid'){
      X.fillStyle=valid?'rgba(100,200,100,0.3)':'rgba(200,100,100,0.3)';
      X.fillRect(dx,dy,COLS*GRID_CL,ROWS*GRID_CL);
      X.strokeStyle=valid?'#4caf50':'#e53935';X.lineWidth=3;
      X.strokeRect(dx,dy,COLS*GRID_CL,ROWS*GRID_CL);
    }else if(S.dragging==='ahır'){
      Drawing.drawBarn(dx,dy,CL*2.5);
    }else if(S.dragging==='kümes'){
      Drawing.drawKümes(dx,dy,CL*2.0);
    }else if(S.dragging==='degirmen'){
      Drawing.drawWindmill(dx,dy,CL*(ISLANDSCAPE?2.8:2.0)*0.8);
    }else if(S.dragging==='kuyu'){
      Drawing.drawWell(dx,dy,CL*2.1);
    }else if(S.dragging==='fırın'){
      Drawing.drawFırın(dx,dy,CL*(ISLANDSCAPE?2.0:1.6));
    }else if(S.dragging==='sutislem'){
      Drawing.drawSutIslem(dx,dy,CL*(ISLANDSCAPE?1.8:1.4));
    }else if(S.dragging==='peynirfab'){
      Drawing.drawPeynirFab(dx,dy,CL*(ISLANDSCAPE?1.8:1.4));
    }else if(S.dragging==='salçafab'){
      Drawing.drawSalcaFab(dx,dy,CL*(ISLANDSCAPE?1.8:1.4));
    }
    X.globalAlpha=1;
  }

  X.restore();
  drawBuildingMenu();

  if(window.plantMode){
    let cr=GameManager.CROPS[window.plantMode];
    X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(W/2-160,48,320,32);X.strokeStyle='#ff9800';X.lineWidth=2;X.strokeRect(W/2-160,48,320,32);
    X.fillStyle='#ff9800';X.font='bold 14px Nunito,sans-serif';X.textAlign='center';X.textBaseline='middle';
    X.fillText('🌱 Ekim Modu: '+cr.name+' — Tarlalara tıkla, çıkmak için boş yere tıkla',W/2,64);X.textAlign='left';
  }
  if(window.harvestModeActive){
    X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(W/2-160,48,320,32);X.strokeStyle='#4caf50';X.lineWidth=2;X.strokeRect(W/2-160,48,320,32);
    X.fillStyle='#4caf50';X.font='bold 14px Nunito,sans-serif';X.textAlign='center';X.textBaseline='middle';
    X.fillText('🌾 Hasat Modu — Hazır tarlalara tıkla, çıkmak için boş yere tıkla',W/2,64);X.textAlign='left';
  }
  if(S.tractorActive){
    X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(W/2-160,48,320,32);X.strokeStyle='#8d6e63';X.lineWidth=2;X.strokeRect(W/2-160,48,320,32);
    X.fillStyle='#8d6e63';X.font='bold 14px Nunito,sans-serif';X.textAlign='center';X.textBaseline='middle';
    X.fillText('🚜 Sürme Modu — Sürülmemiş tarlalara tıkla, çıkmak için boş yere tıkla',W/2,64);X.textAlign='left';
  }
  if(window.pesticideModeActive){
    X.fillStyle='rgba(0,0,0,0.7)';X.fillRect(W/2-160,48,320,32);X.strokeStyle='#7b5800';X.lineWidth=2;X.strokeRect(W/2-160,48,320,32);
    X.fillStyle='#fdd835';X.font='bold 14px Nunito,sans-serif';X.textAlign='center';X.textBaseline='middle';
    X.fillText('🐛 İlaçlama Modu — İlaçlanmamış tarlalara tıkla, çıkmak için boş yere tıkla',W/2,64);X.textAlign='left';
  }
}

let _saveFrameCounter=0;
function loop(){
  let now=Date.now();
  let dt=(now-lastFrameTime)/1000;
  lastFrameTime=now;
  if(GameManager.S.built.degirmen){
    let windSpeed=GameManager.S.windSpeed||5;
    let rotSpeed=windSpeed*0.0015;
    windmillAngle+=rotSpeed*dt*60;
    if(windmillAngle>Math.PI*2)windmillAngle-=Math.PI*2;
  }
  if(S.pickup){
    S.pickup.progress+=S.pickup.speed;
    if(S.pickup.progress>=1&&!S.pickup.returning){
      S.pickup.returning=true;
      S.pickup.progress=0;
      S.pickup.path=S.pickup.path.slice().reverse();
      if(S.pickup.type==='milk'){
        let sut=S.pickup.amount;
        S.inv.SUT=(S.inv.SUT||0)+sut;
        window.sutCount=(window.sutCount||0)+1;
        UIManager.toast(`${sut} lt Süt toplandı! Toplam: ${(S.inv.SUT||0)} lt`);
      }else if(S.pickup.type==='egg'){
        let yumurta=S.pickup.amount;
        S.inv.YUMURTA=(S.inv.YUMURTA||0)+yumurta;
        window.yumurtaCount=(window.yumurtaCount||0)+1;
        UIManager.toast(`${yumurta} Yumurta toplandı! Toplam: ${(S.inv.YUMURTA||0)} adet`);
      }
    }
    if(S.pickup.progress>=1&&S.pickup.returning){
      S.pickup=null;
    }
  }
  draw();
  if(S.pickup){
    let p=S.pickup.path;
    let totalSegs=p.length-1;
    let segProgress=S.pickup.progress*totalSegs;
    let segIdx=Math.min(Math.floor(segProgress),totalSegs-1);
    let segT=segProgress-segIdx;
    let x1=p[segIdx].x,y1=p[segIdx].y,x2=p[segIdx+1].x,y2=p[segIdx+1].y;
    let px=x1+(x2-x1)*segT;
    let py=y1+(y2-y1)*segT;
    let angle=Math.atan2(y2-y1,x2-x1);
    Drawing.drawPickup(px,py,S.pickup.type,angle);
  }
  _saveFrameCounter++;
  if(_saveFrameCounter>=30){_saveFrameCounter=0;GameManager.save();}
  requestAnimationFrame(loop);
}

window.startGame=startGame;
window.showLoginTab=UIManager.showLoginTab;
window.showErr=UIManager.showErr;
window.doLogin=async function(){
  let u=document.getElementById('loginUser').value.trim();
  let p=document.getElementById('loginPass').value;
  if(!u||!p){UIManager.showErr('loginErr','Kullanıcı adı ve şifre gerekli');return}
  let r=await StorageManager.Auth.login(u,p);
  if(!r.success){UIManager.showErr('loginErr',r.error);return}
  startGame();
};
window.doRegister=async function(){
  let u=document.getElementById('regUser').value.trim();
  let p=document.getElementById('regPass').value;
  let p2=document.getElementById('regPass2').value;
  if(p!==p2){UIManager.showErr('regErr','Şifreler eşleşmiyor');return}
  let r=await StorageManager.Auth.register(u,p);
  if(!r.success){UIManager.showErr('regErr',r.error);return}
  startGame();
};
window.doGuestLogin=async function(){
  await StorageManager.Auth.guest();
  if(typeof startGame==='function'){
    GameManager.resetState();
    startGame();
  }else{location.reload()}
};
window.doLogout=async function(){
  await StorageManager.Auth.logout();
  location.reload();
};

function startGame(){
  document.getElementById('loginBg').style.display='none';

  window.X=X;window.CV=CV;window.W=W;window.H=H;window.DPR=DPR;window.isMobile=isMobile;
  window.S=S;window.CF=CF;window.GX=GX;window.GY=GY;window.CL=CL;window.GRID_CL=GRID_CL;window.sceneTop=sceneTop;
  window.GameManager=GameManager;
  window.ISLANDSCAPE=ISLANDSCAPE;window.GRID_LINKED_KUYU=GRID_LINKED_KUYU;window.ROWS=ROWS;window.COLS=COLS;
  window.barnX=barnX;window.barnY=barnY;window.barnS=barnS;
  window.kümesX=kümesX;window.kümesY=kümesY;window.kümesS=kümesS;
  window.wellX=wellX;window.wellY=wellY;window.wellS=wellS;
  window.wmX=wmX;window.wmY=wmY;window.wmS=wmS;
  window.firinX=firinX;window.firinY=firinY;window.firinS=firinS;
  window.sutIslemX=sutIslemX;window.sutIslemY=sutIslemY;window.sutIslemS=sutIslemS;
  window.peynirX=peynirX;window.peynirY=peynirY;window.peynirS=peynirS;
  window.salcaX=salcaX;window.salcaY=salcaY;window.salcaS=salcaS;
  window.sutCount=sutCount;window.yumurtaCount=yumurtaCount;
  window.rainDrops=rainDrops;window.snowFlakes=snowFlakes;
  window.lampPositions=lampPositions;
  window.zoomLevel=zoomLevel;window.zoomTarget=zoomTarget;window.zoomCX=zoomCX;window.zoomCY=zoomCY;
  window.panX=panX;window.panY=panY;window.isPanning=isPanning;window.wasPanning=wasPanning;
  window.panStartX=panStartX;window.panStartY=panStartY;window.panStartPX=panStartPX;window.panStartPY=panStartPY;
  window.pinchDist0=pinchDist0;window.pinchZoom0=pinchZoom0;
  window.frameCount=frameCount;window.windmillAngle=windmillAngle;window.lastFrameTime=lastFrameTime;
  window.plantMode=plantMode;window.harvestModeActive=harvestModeActive;window.pesticideModeActive=pesticideModeActive;
  window.lastPlantClick=lastPlantClick;window.selR=selR;window.selC=selC;
  window.screenToScene=screenToScene;window.sceneToScreen=sceneToScreen;
  window.draw=draw;window.loop=loop;window.calcLayout=calcLayout;
  window.getDaylight=getDaylight;
  window.openM=UIManager.openM;window.closeM=UIManager.closeM;window.openTesisler=UIManager.openTesisler;
  window.toggleMissions=UIManager.toggleMissions;window.openTutorial=UIManager.openTutorial;
  window.closeTutorial=UIManager.closeTutorial;window.toggleTutorialMinimize=UIManager.toggleTutorialMinimize;
  window.tutorialNext=UIManager.tutorialNext;window.advanceTime=UIManager.advanceTime;
  window.activateTraktör=UIManager.activateTraktör;
  window.harvestP=UIManager.harvestP;window.waterP=UIManager.waterP;
  window.pestP=UIManager.pestP;window.removeC=UIManager.removeC;
  window.sellW=UIManager.sellW;window.dismissW=UIManager.dismissW;
  window.updateHUD=UIManager.updateHUD;window.toast=UIManager.toast;
  window.renderM=UIManager.renderM;window.closeAllModals=UIManager.closeAllModals;
  window.openPlotM=UIManager.openPlotM;window.openPlantM=UIManager.openPlantM;
  window.buySeed=UIManager.buySeed;window.buyA=UIManager.buyA;
  window.buyBuilding=UIManager.buyBuilding;window.upgradeBuilding=UIManager.upgradeBuilding;
  window.upgradeRoad=GameManager.upgradeRoad.bind(GameManager);
  window.speakTR=UIManager.speakTR;
  window.startDrag=UIManager.startDrag;window.cancelDrag=UIManager.cancelDrag;
  window.finishDrag=UIManager.finishDrag;window.getBuildingAt=UIManager.getBuildingAt;
  window.showBuildingMenu=UIManager.showBuildingMenu;
  window.sellBuilding=UIManager.sellBuilding;
  window.checkTutorialAction=UIManager.checkTutorialAction;
  window.generateMissions=UIManager.generateMissions;window.renderMissions=UIManager.renderMissions;

  calcLayout();
  zoomCX=W/2;zoomCY=H/2;window.zoomCX=zoomCX;window.zoomCY=zoomCY;

  if(!window._listenersAttached){
    window._listenersAttached=true;
    CV.addEventListener('click',UIManager.handleCanvasClick);
    CV.addEventListener('mousedown',UIManager.handleMouseDown);
    CV.addEventListener('mousemove',UIManager.handleMouseMove);
    CV.addEventListener('mouseup',UIManager.handleMouseUp);
    CV.addEventListener('touchstart',UIManager.handleTouchStart,{passive:true});
    CV.addEventListener('touchmove',UIManager.handleTouchMove,{passive:false});
    CV.addEventListener('touchend',UIManager.handleTouchEnd);
    CV.addEventListener('wheel',UIManager.handleWheel,{passive:false});
    document.addEventListener('keydown',UIManager.handleKeyDown);
    window.addEventListener('resize',function(){resize();calcLayout();window.W=W;window.H=H;window.GX=GX;window.GY=GY;window.CL=CL;window.GRID_CL=GRID_CL;window.sceneTop=sceneTop;window.ISLANDSCAPE=ISLANDSCAPE;window.DPR=DPR;window.isMobile=isMobile});
  }

  UIManager.updateHUD();
  UIManager.generateMissions();
  UIManager.renderMissions();
  setTimeout(()=>{document.getElementById('infoPanel').style.opacity='0'},20000);

  if(!window._intervalStarted){
    window._intervalStarted=true;
    setInterval(function(){
      let Sv=GameManager.S;
      Sv.m++;
      while(Sv.m>=60){Sv.m-=60;Sv.h++}
      if(Sv.h>=22){GameManager.newDay();return}
      Object.keys(Sv.lastHarvestTime).forEach(k=>{if(Sv.lastHarvestTime[k]>0)Sv.lastHarvestTime[k]--});
      Sv.plots.forEach(p=>{if(p.crop&&p.nextHarvest>0)p.nextHarvest--});
      GameManager.checkWhole();
      UIManager.updateHUD();
    },2000);
  }

  loop();
}

window.addEventListener('load',async function(){
  CV=document.getElementById('c');
  X=CV.getContext('2d');

  const _origArc=X.arc.bind(X);
  X.arc=function(cx,cy,r){return _origArc(cx,cy,Math.max(0,r),...Array.prototype.slice.call(arguments,3))};

  resize();
  calcLayout();
  zoomCX=W/2;zoomCY=H/2;

  GameManager.init();
  await GameManager.load();
  GameManager.changeWeather();

  let u=StorageManager.Auth.getUser();
  if(u){
    startGame();
  }else{
    document.getElementById('loginPass').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin()});
    document.getElementById('regPass2').addEventListener('keydown',function(e){if(e.key==='Enter')doRegister()});
  }
});
