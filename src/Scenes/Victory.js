class Victory extends Phaser.Scene {
    constructor() {
        super("winScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load any assets needed for the title screen, e.g., background image, buttons, etc.
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
        this.load.image('winScreen', 'winbg.png');

        this.load.audio('gameover','gameover.wav');
    }

    create() {

        this.add.image(720, 450, 'winScreen').setOrigin(0.5, 0.5).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // my.text.title = this.add.bitmapText(800, 300, "rocketSquare", "JERRY RUN");
        // my.text.title.setScale(2.0);

        //text
        this.add.text(1200, 350, "You Win!", {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            fontWeight: 'bold',
            fill: '#00000'
        }).setOrigin(0.5, 0.5); // Center the text

        this.add.text(1200, 400, 'Press SPACE to play again!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontWeight: 'bold',
            fontStyle: 'bold',
            fill: '#00000'
        }).setOrigin(0.5, 0.5);

        // Set up input to start the game
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('platformerScene');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('platformerScene');
        });

        // Play background music
        this.backgroundMusic = this.sound.add('gameover');
        this.backgroundMusic.play({ loop: false });
    }

    update() {

    }
}
