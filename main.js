class FlappyBirdScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FlappyBirdScene' });
        // Initialisierung der Eigenschaften
        this.bird;
        this.pipes;
        this.score = 0;
        this.scoreText;
        this.gameOver = false;
    }

    preload() {
        this.load.image('bird', 'assets/bird.png');
        this.load.image('pipe', 'assets/pipe.png');
    }

    create() {
        // Vogel erstellen
        this.bird = this.physics.add.sprite(100, 300, 'bird').setScale(0.5);
        this.bird.setCollideWorldBounds(true);

        // Gruppe für die Röhren erstellen
        this.pipes = this.physics.add.group();

        // Erste Reihe von Röhren hinzufügen
        this.addRowOfPipes();

        // Ereignis zum Hinzufügen von Röhren in Intervallen
        this.time.addEvent({
            delay: 1500,
            callback: this.addRowOfPipes,
            callbackScope: this,
            loop: true
        });

        // Steuerung
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown-SPACE', this.flap, this);

        // Punktezähler anzeigen
        this.scoreText = this.add.text(16, 16, 'Punkte: 0', { fontSize: '32px', fill: '#000' });

        // Kollisionserkennung zwischen Vogel und Röhren
        this.physics.add.overlap(this.bird, this.pipes, this.hitPipe, null, this);
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Rotation des Vogels basierend auf der Vertikalgeschwindigkeit
        if (this.bird.body.velocity.y < 0) {
            this.bird.setAngle(-15);
        } else {
            this.bird.setAngle(15);
        }

        // Spiel neu starten, wenn der Vogel den Bildschirm verlässt
        if (this.bird.y > this.sys.game.config.height || this.bird.y < 0) {
            this.restartGame();
        }
    }

    flap() {
        if (this.gameOver) {
            return;
        }
        this.bird.setVelocityY(-350);
    }

    addPipe(x, y) {
        const pipe = this.pipes.create(x, y, 'pipe');
        pipe.setVelocityX(-200);
        pipe.body.allowGravity = false;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    }

    addRowOfPipes() {
        // Bestimme zufällig die Position der Lücke
        const holePosition = Phaser.Math.Between(1, 5);

        // Füge die Röhren hinzu
        for (let i = 0; i < 8; i++) {
            if (i !== holePosition && i !== holePosition + 1) {
                this.addPipe(this.sys.game.config.width, i * 75 + 20);
            }
        }

        // Aktualisiere den Punktestand
        this.score += 1;
        this.scoreText.setText('Punkte: ' + this.score);
    }

    hitPipe() {
        if (this.gameOver) {
            return;
        }

        this.gameOver = true;
        this.bird.setTint(0xff0000);
        this.physics.pause();

        // Kurze Verzögerung, bevor das Spiel neu startet
        this.time.addEvent({
            delay: 1000,
            callback: this.restartGame,
            callbackScope: this
        });
    }

    restartGame() {
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: FlappyBirdScene
};

const game = new Phaser.Game(config);