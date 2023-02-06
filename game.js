const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// game variables and constants
let frame = 0;
const DEGREE = Math.PI/180;

// LOADING SPRITE IMAGE
const sprite = new Image();
sprite.src = "img/sprite.png";

// GAME STATES (object)
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over  : 2
}

// CONTROLLING THE GAME
cvs.addEventListener("click", function (event) {
    switch (state.current) {
        case state.getReady : state.current = state.game;
            break;
        case state.game : bird.flap();
            break;
        case state.over : state.current = state.getReady;
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

// THIS FUNCTION WILL BE USED TO DRAW IN EACH FRAME
function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
}

// THIS FUNCTION WILL BE USED TO UPDATE EVERYTHING WHEN NEEDED
function update() {
    bird.update();
    fg.update();
}

// THIS FUNCTION WILL CREATE LOOPING OF DRAW AND UPDATE FUNCTION WITH EACH FRAME
function loop() {
    update();
    draw();
    frame++;

    requestAnimationFrame(loop);
}

loop();