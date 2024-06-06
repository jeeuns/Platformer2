class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        // this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500; //higher = smaller jump
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.0;
        this.SCORE = 0;
    }

    create() {
        
        this.load.setPath("./assets/");
        this.load.audio('coinpick', 'coinpick.flac');
        this.coinpick = this.sound.add('coinpick');

        this.load.audio('bgmusic', 'bg.wav');

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 240, 45);

        this.bgLayer1 = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background');
        this.bgLayer1.setScale(1.5)
        this.bgLayer1.setOrigin(0, 0);
        this.bgLayer1.setScrollFactor(0);

        this.bgLayer2 = this.add.tileSprite(0, 200, 0, 0, 'clouds');
        this.bgLayer2.setScale(0.5)
        this.bgLayer2.setOrigin(0, 0);
        this.bgLayer2.setScrollFactor(0);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true,
            water: true,
            flag: true
        });

        //touching water

        this.groundLayer.setTileLocationCallback(0, 0, this.map.width, this.map.height, (sprite, tile) => {
            if (tile.properties.water) {
                this.backgroundMusic.stop();
                this.scene.start('deadScene');
            } else if (tile.properties.flag) {
                this.backgroundMusic.stop();
                this.scene.start('winScene');
            }
        }, this);

        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coins",
            key: "tilemap_sheet",
            frame: 151
        });
        

        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar x,y
        my.sprite.player = this.physics.add.sprite(120, 645, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(false); //was originally true

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coinpick.play();
        });
        

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png', 'spark_03.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.walking.stop();

        //jump particle
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_03.png', 'star_07.png'],
            scale: { start: 0.06, end: 0.1 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.jumping.stop();

        
        //CAMERA MOVEMENT
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        //jump sound
        this.jumpSound = this.sound.add('jump');

        // Play background music
        this.backgroundMusic = this.sound.add('bgmusic');
        this.backgroundMusic.play({ loop: true });

    }

    update() {
        this.bgLayer1.tilePositionX = this.cameras.main.scrollX * 0.3;
        this.bgLayer1.tilePositionY = this.cameras.main.scrollY * 0.3;

        this.bgLayer2.tilePositionX = this.cameras.main.scrollX * 0.5;
        this.bgLayer2.tilePositionY = this.cameras.main.scrollY * 0.5;

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // if (cursors.up.isDown) {
        //     my.sprite.player.anims.play('jump', true);
        //     my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
        //     my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        //     // Only play smoke effect if touching the ground

        //     if (my.sprite.player.body.blocked.down) {
        //         my.vfx.jumping.start();
        //     }

        // } else {
        //     my.sprite.player.anims.play('idle');
        //     my.vfx.jump.stop();
        // }

        // Player jump
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.jumping.start();
        }
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play(); // Play jump sound
            my.vfx.jumping.start();
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.backgroundMusic.stop();
            this.scene.restart();
        }

    }

}