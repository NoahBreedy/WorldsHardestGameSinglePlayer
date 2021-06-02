const socket = io();
const Max_Levels = 10,playerSpeed=1.25;
let AllLevels,levels,totalDeaths=0,prestiges=0,deaths=0,myQueue=[];
/**
 * TODO: ADD DIFFERENT PLAYER COLORS [DONE]
 * TODO: ADD DEATH COUNTER FOR EACH LEVEL you are on [DONE]
 * TODO: Create a check point block
 * TODO: Finish Multiplayer (technicaly its done but i need better hosting or i guess i could convert it to an actual                                       application instead of a browser game turning into a p2p thing idk whatever i dont care)
 * 
*/



//Socket Events
socket.on('giveLevels',(data)=>{
   AllLevels = data;
   renderLevels(AllLevels);
});

// //Sound
// let music;
// function preload() {
//   soundFormats('mp3', 'ogg');
//   music = loadSound('music/gameNoise');
// }



//Graphics

let myLevel = 0;
let exitCoins =0;
let data;
let grid;
const res = 25;
let balls = [];
let coins = [];
let p1;
let pg;
let loaded = false;

function setup() {
  //for Object
  cnv = createCanvas(600, 400);
  cnv.parent("Game");
  cnv.hide();
  //for Map
  pg = createGraphics(600, 400);
  cols = (width/res);
  rows = (height/res);
  rectMode(CORNER);
}

function init(){
   document.body.style.overflow  = "hidden";
   deaths = 0;
   document.getElementById("create").style.display = "none";
   document.getElementById("join").style.display = "none";
   document.getElementById("createR").style.display = "none";
   document.getElementById('objectContainer').style.display = "none";
   document.getElementById('dcBtn').style.visibility = "visible";
   document.getElementById('statsContainer').style.display = "block";
  loaded = false;
  deaths = 0;
  const titleMessage = `${levels[myLevel].ProjectName} <br> by: ${levels[myLevel].User}`
  document.getElementById('currentTitleMsg').innerHTML = `${titleMessage}`;
  data = JSON.parse(levels[myLevel].Data);
  grid = data.map;
  drawGrid();
  const starts = getStarts(grid);
  let start = starts[int(random(starts.length))];
  try{
    p1 = new Player(start.x,start.y,"#c40000");
  }catch{
    p1 = new Player(0,0,"#c40000");
  }
  balls = [];
  coins = [];
  for(var ball of data.balls){
    balls.push(new Ball(ball.x,ball.y,ball.i,ball.pos,ball.speed));
  }
  for(var i =0; i<data.coins.length;i++){
    coins.push(new Coin(data.coins[i].x,data.coins[i].y));
  }
  exitCoins = data.coins.length;
  resetCoins(true);
  firstSetup = false;
  loaded = true;
  cnv.show();
}

function resetCoins(initial){
  coins = [];
  for(var coin of data.coins){
    coins.push(new Coin(coin.x,coin.y));
  }
  if(initial != true){
    deaths++;
    totalDeaths++;
  }
  const titleMessage = `${levels[myLevel].ProjectName} <br> by: ${levels[myLevel].User}`
  document.getElementById('stats').innerHTML = `Total Deaths: ${totalDeaths} <br> Current Level Deaths: ${deaths} <br> Course Completions: ${prestiges}<br> Player:`;
}

function draw() {
  /* Weird P5 bug if I forget this [March 12 2021] */
  noStroke();
  if(loaded){
    if(firstSetup){
      init();
    }
    image(pg, 0, 0);
    for(var ball of balls){
      ball.show();
      ball.update();
      p1.collidesBall(ball);
    }
    for(var k =0;k<coins.length;k++){
      coins[k].show();
      if(p1.collidesCoin(coins[k])){
        p1.coins++;
        coins.splice(k,1);
      }
    }
    //Player Functions
    p1.show();
    p1.col = document.getElementById("col").value;
    handelKeyBoard();
  }
}


function handelKeyBoard(){
  if(keyIsDown(38) || keyIsDown(87)){ //Up
    p1.y -= playerSpeed;
    if(p1.collidesWorld() == 1){
      p1.y += playerSpeed;
    }
  }
  if(keyIsDown(40) || keyIsDown(83)){//Down
    p1.y += playerSpeed;
    if(p1.collidesWorld("nextD") == 1){
      p1.y -= playerSpeed;
    }
  }
  if(keyIsDown(39) || keyIsDown(68)){//Right
    p1.x += playerSpeed;
    if(p1.collidesWorld("nextR") == 1){
      p1.x -= playerSpeed;
    }
  }
  if(keyIsDown(37) || keyIsDown(65)){//Left
    p1.x -= playerSpeed;
    if(p1.collidesWorld() == 1){
      p1.x += playerSpeed;
    }
  }
  if(p1.collidesWorld() == 3 && p1.coins >= exitCoins){
      myLevel++;
      myLevel = myLevel%levels.length;
      if(myLevel == 0){
        prestiges++;
        deaths = 0;
      }
      document.getElementById('stats').innerHTML = `Total Deaths: ${totalDeaths} <br> Current Level Deaths: ${deaths} <br> Course Completions: ${prestiges}<br> Player:`;
      init();
    }
}

const colors = {
  1 : "#1cd1ed",
  2 : "#bffcb6",
  3 : "#ffc1a6",
  6 : "#ff8f70",
  7 : "#80a8ff",
  8 : "#ffffff",
  9 : "#000000",
}


function Ball(x,y,i,pos,speed){
  this.x = x;
  this.y = y;
  this.myInd = i;
  this.r = 20;
  this.pos = pos;
  this.speed = speed;
  this.selected = false;
  this.ind = 1;
  this.done = false;
  this.plane = "X";
  this.update = () =>{
    if(this.pos.length>1){
      const next = this.pos[this.ind];
    if(this.plane == "X"){
       if(this.x>next.x){
         this.x -= this.speed;
         this.not = true;
       }else if(this.x < next.x){
         this.x += this.speed;
       }
      if(this.x == next.x){
        this.plane = "Y";
      }
    }else if(this.plane == "Y"){
      if(this.y>next.y){
         this.y -= this.speed;
       }else if(this.y < next.y){
         this.y += this.speed;
       }
      if(this.y == next.y){
        this.done = true;
      }
    }
    if(this.done){
      if(this.ind<this.pos.length){
        this.ind++;
        this.done = false;
        this.plane = "X";
      }
      if(this.ind>=this.pos.length){
        this.x = this.pos[0].x
        this.y = this.pos[0].y
        this.ind = 1;
      }
    }
    }
   }
    this.show = () => {
      push()
      if(this.selected){
        for(var i=0;i<this.pos.length;i++){
          noStroke();
          fill('rgba(253, 255, 112,0.25)')
          rect(this.pos[i].x,this.pos[i].y,res,res);
        } 
      }
      fill("#0013bf")
      circle(this.x+(res/2),this.y+(res/2),this.r);
      pop()
  }
  }
  
  
     


function Coin(x,y){
  this.x = x;
  this.y = y;
  this.r = 5;
  this.show = ()=>{
    push()
    fill("#fff700");
    stroke(0)
    circle(this.x,this.y,this.r);
    pop()
  }
  this.mouseTouch = (mouse) =>{
    return dist(mouse.x,mouse.y,this.x,this.y)<this.r;
  }
}



function getsingleNeighbors(grid,i,j){
  try{
    const spot =  grid[i][j];
    return spot;
  }catch{
    //spot dosnt exist
    return undefined;
  }
}

function getNeighbors(i,j){
  let arr = [];
  arr.push(getsingleNeighbors(grid,i-1,j-1));
  arr.push(getsingleNeighbors(grid,i-1,j));
  arr.push(getsingleNeighbors(grid,i-1,j+1));
  arr.push(getsingleNeighbors(grid,i,j-1));
  arr.push(getsingleNeighbors(grid,i,j+1));
  arr.push(getsingleNeighbors(grid,i+1,j-1));
  arr.push(getsingleNeighbors(grid,i+1,j));
  arr.push(getsingleNeighbors(grid,i+1,j+1));
  return arr;
}


function CircleCircle(c1,c2){
   const d = dist(c1.x,c1.y,c2.x,c2.y);
   return d<(c1.r+c2.r)/2;
}

function Player(x,y,col){
  this.x = x;
  this.y = y;
  this.col = col;
  this.r = 10;
  this.coins = 0;
  this.collidesBall = (c) =>{
    const c2 = {x:c.x+(res/2),y:c.y+(res/2),r:c.r}
    const c1 = {x:this.x,y:this.y,r:this.r}
    if(CircleCircle(c1,c2)){
      const starts = getStarts(grid);
      let start = starts[int(random(starts.length))];
      this.x = start.x;
      this.y = start.y;
      this.coins = 0;
      resetCoins();
    }
  }
  this.collidesCoin = (c) =>{
    const c2 = {x:c.x,y:c.y,r:c.r}
    const c1 = {x:this.x,y:this.y,r:this.r}
    return CircleCircle(c1,c2);   
  }
  
  this.collidesWorld = (call) =>{
    const x = int(this.x/res);
    const y = int(this.y/res);
    //Since  RectMode is Corner
    if(call == "nextR"){
      let nX = int((this.x+10)/res);
      return grid[nX][y]
    }
    if(call == "nextD"){
      let nY = int((this.y+10)/res);
      return grid[x][nY]
    }
    return grid[x][y];
  }
    
  this.show = () => {
    push()
    stroke(0);
    fill(this.col);
    rect(this.x,this.y,10,10); 
    /* hitBox */
    // fill("green");
    // circle(this.x+(this.r/2),this.y+(this.r/2),this.r);
    pop()
  }
}

//Draws World blocks
function drawGrid(){
  for(var i =0; i<cols;i++){
    for(var j =0;j<rows;j++){
       const x = i*res;
       const y = j*res;
       pg.push()
      if(grid[i][j] == 0){
        if((i+j) % 2 == 0){
          pg.fill(data.col[0]);
        }else{
          pg.fill(data.col[1]);
        }
      }else{
        try{
          pg.fill(colors[grid[i][j]])
        }catch{
          
        }
        
      }
      pg.noStroke();
      pg.rect(x,y,res,res);
      if(grid[i][j]==1){
      drawWalls(x,y,i,j);
      }
      pg.pop()
    }
  }
}

//Renders the box edges
function drawWalls(x,y,i,j){
        pg.stroke(0)
        const neigh = getNeighbors(i,j);
        for(var k =0;k<neigh.length;k++){
          if(neigh[1] != 1 && neigh[1] != null){
            pg.push()
            pg.strokeWeight(2);
            pg.line(x,y,x,y+res)
            pg.pop()
          }
          if(neigh[3] != 1 && neigh[3] != null){
            pg.push()
            pg.strokeWeight(2);
            pg.line(x,y,x+res,y);
            pg.pop()
          }
          if(neigh[4] != 1 && neigh[4] != null){
            pg.push()
            pg.strokeWeight(3);
            pg.line(x,y+res,x+res,y+res);
            pg.pop()
          }
          if(neigh[6] != 1 && neigh[6] != null){
            pg.push()
            pg.strokeWeight(3);
            pg.line(x+res,y,x+res,y+res);
            pg.pop()
          }
          
        }
}


// Utility Functions
function goToPage(pageNum){
   if(pageNum == 1){
     socket.emit('getLevels',null);  
   }else if(pageNum == 2){
     window.location.href = "https://WorldsHardestLevelEditor.bigboyz.repl.co";
   }
}

function createRoom(){
  if(myQueue.length>0){
     levels = myQueue;
     init();
     document.getElementById("Game").style.visibility = "visible";
  }else{
    alert("Need At Least  1 Room To Make a game");
  }
}

function leaveRoom(){
  //This was stupid idk why I had it here.....
  // const question = window.prompt("Are You Sure (type yes to leave room)?");
  // if(question.toLowerCase() == "yes"){
  //   window.location.reload();
  // }

  window.location.reload();
}

function addToQueue(me,level){
    if(isValid(level.Id)){
      if(myQueue.length < Max_Levels){
        myQueue.push(level);
        me.style.backgroundColor  = "#f03c00";
      }else{
        alert(`Cannot have more than ${Max_Levels} levels!`);
      }
      
    }else{
      //Remove From List
      for(var i=0;i<myQueue.length;i++){
        if(myQueue[i].Id == level.Id){
          myQueue.splice(i,1);
          me.style.backgroundColor  = "#00e0f0";
          break;
        }
      }
    } 
    document.getElementById("currentTitleMsg").innerHTML= `Click on a button to Add to your Queue <br> Then click Create Room <br> current queue length: ${myQueue.length}`;  
}

function isValid(find){
  //finds if level is already in queue
  for(var i=0;i<myQueue.length;i++){
        if(myQueue[i].Id == find){
          return false
        }
  }
  return true
}

function renderLevels(levels){
  document.getElementById("currentTitleMsg").innerHTML = "Click on a button to Add to your Queue <br> Then click Create Room <br> current queue length: 0";
  levels.forEach(level =>{
    var button = document.createElement('button');
    button.className = "levelInstance"
    button.innerHTML = level.ProjectName +"<br> by: " + level.User;
    button.onclick = function(){
      addToQueue(button,level);return false;
    };
    document.getElementById('objectContainer').appendChild(button);
  });
  
  document.getElementById("create").style.display = "none";
  document.getElementById("join").style.display = "none";
  document.getElementById("createR").style.visibility = "visible";
  document.getElementById("Game").style.visibility = "none";
  document.getElementById("objectContainer").style.display = "";
}

function getStarts(grid){
  let starts = [];
  for(var i =0;i<cols;i++){
    for(var j =0;j<rows;j++){
      if(grid[i][j] == 2){
        starts.push({x:i*res,y:j*res});
      }
    }
  }
  return starts;
}