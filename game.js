const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// game variables and constants
let frame = 0;
const DEGREE = Math.PI/180;

// LOADING SPRITE IMAGE
const sprite = new Image();
sprite.src = "Assets/img/sprite.png";

// LOADING SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "Assets/audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "Assets/audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "Assets/audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "Assets/audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "Assets/audio/sfx_die.wav";

// GAME STATES (object)
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over  : 2
}

// START BUTTON COORDINATES
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROLLING THE GAME
cvs.addEventListener("click", function (event) {
    switch (state.current) {
        case state.getReady :
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game :
            bird.flap();
            FLAP.play();
            break;
        case state.over :
            let rect = cvs.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let clickY = event.clientY - rect.top;

            // CHECK IF WE CLICK OF THE START BUTTON
            if (clickX >= startBtn.x &&
                clickX <= startBtn.x + startBtn.w &&
                clickY >= startBtn.y &&
                clickY <= startBtn.y + startBtn.h) {
                    pipes.reset();
                    bird.speedReset();
                    score.reset();

                    state.current = state.getReady;
                }

            break;
    }
});

// BACKGROUND (object)
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,

    draw : function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

// FOREGROUND (object)
const fg = {
    sX : 276,
    sY : 0,
    w : 224,
    h : 112,
    x : 0,
    y : cvs.height - 112,

    dx : 2,

    draw : function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update : function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w/2);
        }
    }
}

// BIRD (object)
const bird = {
    animation : [
        {sX : 276, sY : 112},
        {sX : 276, sY : 139},
        {sX : 276, sY : 164},
        {sX : 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,

    radius : 12,

    frame : 0,

    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,

    draw : function () {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);

        ctx.restore();
    },

    flap : function () {
        this.speed = - this.jump;
    },

    update : function () {
        // IF GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frame % this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 TO 4, THEN AGAIN TO 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            // RESET BIRD POSITION AFTER GAME OVER
            this.y = 150;
            this.rotation = 0 * DEGREE;

        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h/2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h/2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE.play();
                }
            }

            // IF THE SPEED IS GREATER THAN JUMP, IT MEANS THAT THE BIRD IS FALLING DOWN
            if (this.speed >= this.jump) {
                this.rotation  = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation  = -25 * DEGREE;
            }
        }
    },

    speedReset : function () {
        this.speed = 0;
    }
}

// GET READY MESSAGE STATE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,

    draw : function () {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// GAME OVER MESSAGE STATE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,

    draw : function () {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// PIPES (object)
 const pipes = {
    position : [],

    top : {
        sX : 553,
        sY : 0
    },
    bottom : {
        sX : 502,
        sY : 0
    },

    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,

    draw : function () {
        for (let i = 0; i < this.position.length; i++) {
            let pos = this.position[i];
            let topYPos = pos.y;
            let bottomYPos = pos.y + this.h + this.gap;

            // draw the top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, pos.x, topYPos, this.w, this.h);

            // draw the bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, pos.x, bottomYPos, this.w, this.h);
        }
    },

    update : function () {
        if (state.current !== state.game) return;

        if (frame % 100 == 0) {
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let pos = this.position[i];
            let bottomPipeYPos = pos.y + this.h + this.gap;
            
            // COLLISION DETECTION (bird & pipe)
            // FOR TOP PIPE
            if (bird.x + bird.radius > pos.x &&
                bird.x - bird.radius < pos.x + this.w &&
                bird.y + bird.radius > pos.y &&
                bird.y - bird.radius < pos.y + this.h) {
                    state.current = state.over;
                    HIT.play();
            }

            // FOR BOTTOM PIPE
            if (bird.x + bird.radius > pos.x &&
                bird.x - bird.radius < pos.x + this.w &&
                bird.y + bird.radius > bottomPipeYPos &&
                bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                HIT.play();
            }
            
            // MOVE THE PIPES TO THE LEFT
            pos.x -= this.dx;

            // if the pipes goes beyond the canvas, we delete them from the array
            if (pos.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function () {
        this.position = [];
    }
}

// SCORE (object)
const score = {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    draw : function () {
        ctx.fillStyle = "#FFF";
        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50); // (text, x-axis, y-axis)
            ctx.strokeText(this.value, cvs.width/2, 50);
        } else  if (state.current == state.over) {
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    reset : function () {
        this.value = 0;
    }
}

// THIS FUNCTION WILL BE USED TO DRAW IN EACH FRAME
function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // sequential layer-wise drawing of elements
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw()
    credit();
}

// THIS FUNCTION WILL BE USED TO UPDATE EVERYTHING WHEN NEEDED
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

// DISPLAY CREDIT
function credit() {
    ctx.fillStyle = "#FFF"
    ctx.lineWidth = 2;
    let creditName = "© Varun Maharana";
    ctx.font = "10px Roboto";
    ctx.fillText(creditName, cvs.width - 200, cvs.height - 10);
    // ctx.strokeText(creditName, cvs.width/2, cvs.height - 20);
} 

// THIS FUNCTION WILL CREATE LOOPING OF DRAW AND UPDATE FUNCTION WITH EACH FRAME
function loop() {
    update();
    draw();
    frame++;

    requestAnimationFrame(loop);
}

loop();