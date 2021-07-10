const cvs  = document.getElementById("bird");
const ctx = cvs.getContext("2d");

//Variables and constants

let frames = 0;
const DEGREE = Math.PI/180;

// Sprites
const sprite = new Image();
sprite.src = 'images/sprite.png'; 

//load sounds
//score
const Score_sound =new Audio();
Score_sound.src = 'sounds/score.mp3';

const flap_sound =new Audio();
flap_sound.src = 'sounds/fly.mp3';

const hit_sound =new Audio();
hit_sound.src = 'sounds/audio_sfx_hit.wav';

const die_sound =new Audio();
die_sound.src = 'sounds/audio_sfx_die.wav';

//game state
const state ={
    current : 0,
    getReady:0,
    game:1,
    over:2
}
// control the game
document.addEventListener('click', function(evt)
{
    switch(state.current)
    {
        case state.getReady:
            state.current =state.game;
            break;
        case state.game:
            bird.flap();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX -rect.left;
            let clickY = evt.clientY -rect.top;
            if(clickX> startBtn.x && clickX < startBtn.x+startBtn.w && clickY>= startBtn.y && clickY < startBtn.y+startBtn.h ){
                pipes.reset();
                bird.speedreset();
                score.reset();
            }
            state.current = state.getReady;
            break;

    }
});
// start button
const startBtn = {
    x : 120,
    y:263,
    w:83,
    h:29,


}
//Background
const bg ={ 
    sX: 0,
    sY: 0,
    w : 275,
    h : 226,
    x: 0,
    y : cvs.height- 226, 
    draw : function(){
        ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x,this.y,this.w,this.y);
        ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x+this.w,this.y,this.w,this.y);
    }

}
// foreground
const fg= {
    sX: 276,
    sY: 0,
    w : 224,
    h : 112,
    x: 0,
    y : cvs.height- 112, 
    dx:2,
    draw : function(){
        ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x,this.y,this.w,this.h);
        ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x+this.w,this.y,this.w,this.h);
       
    },
    update: function()
    {
        if(state.current == state.game)
        {
           this.x = (this.x-this.dx) %(this.w/2);
        }
    }

}
 
//Bird
const bird= {

    animation :[
        { sX : 276, sY : 112 },
        { sX : 276, sY : 139},
        { sX : 276, sY : 164},
        { sX : 276, sY : 139}
    ],
        x: 50, 
        y: 150,
        w: 34,
        h: 26,
        frame :0,
        speed:0,
        gravity : 0.25,
        jump:4.6,
        rotation:0,
        radius:12,


  
    draw : function(){
        let bird= this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation)
        ctx.drawImage(sprite, bird.sX,bird.sY,this.w,this.h,-this.w/2,-this.w/2,this.w,this.h);
        ctx.restore();
       
    },
    flap :function(){
        this.speed= -this.jump;
        flap_sound.play();

    },
    update: function()
    {
        this.period =state.current == state.getReady? 10:5;
        this.frame += frames%this.period==0?1:0;
        this.frame = this.frame%this.animation.length;
        if(state.current == state.getReady)
        {
            this.y =150;
            this.rotation = 0*DEGREE;
        }
        else{
            this.speed += this.gravity;
            this.y += this.speed;
            if(this.y + this.h/2 >= cvs.height -fg.h )
            { 
                this.y= cvs.height -fg.h-this.h/2;
                if(state.current == state.game)
                {
                    state.current = state.over; 
                    hit_sound.play();
                    die_sound.play();
                }
               
            }
            if(this.speed >= this.jump)
            {
                this.rotation = 90* DEGREE;
                this.frame=1;
               
            }
            else{
              this.rotation=-25*DEGREE;       

            }
        }
    },
    speedreset: function(){
        this.speed=0;
    }

}
//pipes
const pipes ={
    position:[],
    bottom:{
        sX:502,
        sY:0,


    },
    top:{
        sX :553,
        sY : 0,

    },
    w:53,
    h:400,
    gap:85,
    dx:2,
    maxYPos: -150,
    
    draw : function(){
        for(let i=0;i< this.position.length; i++)
        {
            let p=this.position[i];
            let topYPos =p.y;
            let bottomYPos = p.y+this.h+this.gap;
            ctx.drawImage(sprite, this.top.sX,this.top.sY,this.w,this.h,p.x,topYPos,this.w,this.h);
            ctx.drawImage(sprite, this.bottom.sX,this.bottom.sY,this.w,this.h,p.x,bottomYPos,this.w,this.h);

        }
    },
    update: function(){
        if(state.current !== state.game)return;
        if(frames%100 == 0){
            this.position.push({
                x:cvs.width,
                y:this.maxYPos *(Math.random()+1)
            });

        }
        for(let i=0; i<this.position.length;i++)
        {
            let p = this.position[i];
            
            let bottomPipeYPos =p.y+this.h+this.gap;
            if(bird.x+bird.radius> p.x && bird.x-bird.radius< p.x+this.w && bird.y+bird.radius>p.y && bird.y-bird.radius <p.y+this.h)
            {
                state.current= state.over;
                hit_sound.play();
                    die_sound.play();
            }
            if(bird.x+bird.radius> p.x && bird.x-bird.radius< p.x+this.w && bird.y+bird.radius>bottomPipeYPos && bird.y-bird.radius < bottomPipeYPos+this.h)
            {
                state.current= state.over;
                hit_sound.play();
                    die_sound.play();
            }
            p.x -= this.dx;
            if (p.x+this.w <=0)
            {
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
                Score_sound.play();


            }
        }
    },
    reset:function(){
        this.position =[];
    }
}
//Get ready

const getReady= {
    sX: 0,
    sY: 228,
    w : 173,
    h : 152,
    x: cvs.width/2 - 173/2,
    y : 80, 
    draw : function(){
        if(state.current == state.getReady)
        {
            ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x,this.y,this.w,this.h);

        }
    
       
    }

}
//game over
const gameOver= {
    sX: 175,
    sY: 228,
    w : 225,
    h : 202,
    x: cvs.width/2 - 225/2,
    y : 90, 
    draw : function(){
        if(state.current == state.over)
        {
            ctx.drawImage(sprite, this.sX,this.sY,this.w,this.h,this.x,this.y,this.w,this.h);

        }
    
       
    }

}
//Score
const score ={
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    draw: function(){
        ctx.fillStyle = '#fff';
        ctx.strokeStyle ="#000";
        if(state.current == state.game)
        {
            ctx.lineWidth =2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value,cvs.width/2,50);
            ctx.strokeText(this.value,cvs.width/2,50);
            
        }
        else if(state.current == state.over)
        {
            ctx.font = "25px Teko";
            ctx.fillText(this.value,225,186);
            ctx.strokeText(this.value,225,186);
            //best score
            ctx.fillText(this.value,225,228);
            ctx.strokeText(this.value,225,228);
            
        }

    },
    reset :function(){
        this.value =0; 
    }
}

//Draw to canvas
function draw()
{
    ctx.fillStyle = '#96e0e0';
    ctx.fillRect(0,0,cvs.width,cvs.height)
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    
}

//Update frames
function update()
{
    bird.update();
    fg.update();
    pipes.update();
}

//Loop function
function loop(){
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);

}
loop();