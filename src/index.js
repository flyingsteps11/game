import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import './component.js';
import bg from './assets/images/background.jpg';
import basket from './assets/images/basket2.png';
import pillow1 from './assets/images/pillow2.png';
import pillow2 from './assets/images/pillow3.png';
import pillow3 from './assets/images/pillow4.png';
import pillow4 from './assets/images/pillow5.png';


import bleep from './assets/audio/bleep.wav';
import smashsh from './assets/audio/smash.mp3';
import marimba from './assets/audio/Tyga.mp3';


window.onload = function () {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let canvasBack = document.getElementById("backgroundCanvas");
    let contextBack = canvasBack.getContext("2d");

    let timer;

    let highScore = 0;

    let background = new Image();
    background.src = bg;
    background.style.backgroundPosition = "center";
    background.style.backgroundSize = "cover";
    background.style.objectFit = "cover";

    let catchSounds = [];
    let catchSoundCounter = 0;

    for (let i = 0; i < 5; i++) {
        var catchSound = new Audio();
        catchSound.src = bleep;
        catchSounds.push(catchSound);
    }

    var music = new Audio();
    music.src = marimba;
    music.loop = true;

    let smashSounds = [];
    let smashCounter = 0;

    for (let i = 0; i < 5; i++) {
        var smash = new Audio();
        smash.src = smashsh;
        smashSounds.push(smash);
    }

    let player;
    let pillows = [];
    let numberOfPillow = 15;

    //Player constructor
    function Player() {
        this.gameOver = false;
        this.score = 0;
        this.pillowCollected = 0;
        this.pillowMissed = 0;
        this.playerWidth = 150;
        this.playerHeight = 90;
        this.playerSpeed = 10;
        this.x = canvas.width / 2;
        this.y = canvas.height - this.playerHeight;
        this.playerImage = new Image();

        this.playerImage.src = basket;

        this.render = function () {
            context.drawImage(this.playerImage, this.x, this.y);
        }

        //влево
        this.moveLeft = function () {
            if (this.x > 0) {
                this.x -= this.playerSpeed;
            }
        }

        //вправо
        this.moveRight = function () {
            if (this.x < canvas.width - this.playerWidth) {
                this.x += this.playerSpeed;
            }
        }

    }

    //Pillow
    function Pillow() {
        this.pillowNumber = Math.floor(Math.random() * 5);
        this.pillowType = "";
        this.pillowScore = 0;
        this.pillowWidth = 50;
        this.pillowHeight = 50;
        this.pillowImage = new Image();
        this.pillowSpeed = Math.floor(Math.random() * 3 + 1);
        this.x = Math.random() * (canvas.width - this.pillowWidth);
        this.y = Math.random() * -canvas.height - this.pillowHeight;

        this.choosePillow = function () {
            if (this.pillowNumber == 0) {
                this.pillowType = "gabe";
                this.pillowScore = 5 * this.pillowSpeed;
                this.pillowImage.src = pillow1;
            } else if (this.pillowNumber == 1) {
                this.pillowType = "emoji";
                this.pillowScore = 10 * this.pillowSpeed;
                this.pillowImage.src = pillow2;
            } else if (this.pillowNumber == 2) {
                this.pillowType = "hz";
                this.pillowScore = 15 * this.pillowSpeed;
                this.pillowImage.src = pillow3;
            } else if (this.pillowNumber == 3) {
                this.pillowType = "tyler";
                this.pillowScore = 20 * this.pillowSpeed;
                this.pillowImage.src = pillow4;
            }
        }

        this.fall = function () {
            if (this.y < canvas.height - this.pillowHeight) {
                this.y += this.pillowSpeed;
            } else {
                smashSounds[smashCounter].play();
                if (smashCounter == 4) {
                    smashCounter = 0;
                } else {
                    smashCounter++;
                }

                player.pillowMissed += 1;
                this.changeState();
                this.choosePillow();
            }
            this.checkIfCaught();
        }

        this.checkIfCaught = function () {
            if (this.y >= player.y) {
                if ((this.x > player.x && this.x < (player.x + player.playerWidth)) ||
                    (this.x + this.pillowWidth > player.x && this.x + this.pillowWidth < (player.x + player.playerWidth))) {
                     catchSounds[catchSoundCounter].play();
                    if (catchSoundCounter == 4) {
                        catchSoundCounter = 0;
                    } else {
                        catchSoundCounter++;
                    }

                    player.score += this.pillowScore;
                    player.pillowCollected += 1;

                    this.changeState();
                    this.choosePillow();
                }
            }
        }

        this.changeState = function () {
            this.pillowNumber = Math.floor(Math.random() * 5);
            this.pillowSpeed = Math.floor(Math.random() * 3 + 1);
            this.x = Math.random() * (canvas.width - this.pillowWidth);
            this.y = Math.random() * -canvas.height - this.pillowHeight;
        }

        this.render = function () {
            context.drawImage(this.pillowImage, this.x, this.y);
        }
    }


    document.addEventListener("mousemove", mouseMoveHandler, false);

    window.addEventListener("keydown", function (e) {
        e.preventDefault();
        if (e.keyCode == 37) {
            player.moveLeft();
        } else if (e.keyCode == 39) {
            player.moveRight();
        } else if (e.keyCode == 13 && player.gameOver == true) {
            main();
            window.clearTimeout(timer);
        }
    });

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if(relativeX > 0 && relativeX < canvas.width) {
            this.paddleX = relativeX - this.paddleWidth/2;
        }
    }

    main();


    function main() {
        contextBack.font = "bold 23px Roboto";
        contextBack.fillStyle = "WHITE";
        player = new Player();
        pillows = [];

        for (let i = 0; i < numberOfPillow; i++) {
            var pillow = new Pillow();
            pillow.choosePillow();
            pillows.push(pillow);
        }

        startGame();
    }

    function startGame() {
        updateGame();
        window.requestAnimationFrame(drawGame);
    }

    function updateGame() {
        music.play();
        if (player.pillowMissed >= 10) {
            player.gameOver = true;
        }

        for (let j = 0; j < pillows.length; j++) {
            pillows[j].fall();
        }
        timer = window.setTimeout(updateGame, 30);
    }

    function drawGame() {
        if (player.gameOver == false) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            contextBack.clearRect(0, 0, canvasBack.width, canvasBack.height);

            contextBack.drawImage(background, 0, 0);
            player.render();

            for (let j = 0; j < pillows.length; j++) {
                pillows[j].render();
            }
            contextBack.fillText("Счёт: " + player.score, 50, 50);
            contextBack.fillText("Лучший счёт: " + highScore, 250, 50);
            contextBack.fillText("Подушек поймано: " + player.pillowCollected, 500, 50);
            contextBack.fillText("Пропущено: " + player.pillowMissed, 780, 50);
        } else {

            for (let i = 0; i < numberOfPillow; i++) {

                pillows.pop();
            }

            if (highScore < player.score) {
                highScore = player.score;
                contextBack.fillText("Новый лучший счёт: " + highScore, (canvas.width / 2) - 100, canvas.height / 2);
            }

            contextBack.fillText("PRESS F(enter)", (canvas.width / 2) - 360, canvas.height / 2 + 50);
            context.clearRect(0, 0, canvas.width, canvas.height);

        }
        window.requestAnimationFrame(drawGame);

    }
}