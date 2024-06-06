class Start extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load any assets needed for the title screen, e.g., background image, buttons, etc.
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
        this.load.image('titlescreen', 'title.png');
    }

    create() {

        this.add.image(720, 450, 'titlescreen').setOrigin(0.5, 0.5).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // my.text.title = this.add.bitmapText(800, 300, "rocketSquare", "JERRY RUN");
        // my.text.title.setScale(2.0);

        //text
        this.add.text(1000, 350, "Jerryland", {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5); // Center the text

        this.add.text(1000, 400, 'Press SPACE to Start', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontWeight: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Set up input to start the game
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('platformerScene');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('platformerScene');
        });
    }

    update() {

    }
}
