// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-06T22:55:15.929Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelRishabsfa3.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/CSSEportfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelRishabsfa3 from '/CSSEportfolio/assets/js/GameEnginev1/GameLevelRishabsfa3.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelRishabsfa3];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Npc from '/assets/js/GameEnginev1/essentials/Npc.js';
import Barrier from '/assets/js/GameEnginev1/essentials/Barrier.js';

class GameLevelRishabsfa3 {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/image.png",
            pixels: { height: 422, width: 600 }
        };

        const playerData = {
            id: 'playerData',
            src: path + "/images/gamebuilder/sprites/dew.png",
            SCALE_FACTOR: 5,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 100, y: 300 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down: { row: 0, start: 0, columns: 3 },
            downRight: { row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft: { row: 0, start: 0, columns: 3, rotate: -Math.PI/16 },
            left: { row: 1, start: 0, columns: 3 },
            right: { row: 2, start: 0, columns: 3 },
            up: { row: 3, start: 0, columns: 3 },
            upLeft: { row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
            upRight: { row: 3, start: 0, columns: 3, rotate: -Math.PI/16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
            };

        const npcData1 = {
            id: 'The Ruin Guard',
            greeting: 'Welcom traveler, to the ruins of Natlan! Below, you will find magical worlds that cannot exist but in your mind, treasure, and danger more than you have ever known. Press Esc, if you dare, and enter the realm below',
            src: path + "/images/gamebuilder/sprites/dew.png",
            SCALE_FACTOR: 5,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 210, y: 158 },
            pixels: { height: 256, width: 256 },
            orientation: { rows: 4, columns: 4 },
            down: { row: 0, start: 0, columns: 3 },
            right: { row: Math.min(1, 4 - 1), start: 0, columns: 3 },
            left: { row: Math.min(2, 4 - 1), start: 0, columns: 3 },
            up: { row: Math.min(3, 4 - 1), start: 0, columns: 3 },
            upRight: { row: Math.min(3, 4 - 1), start: 0, columns: 3 },
            downRight: { row: Math.min(1, 4 - 1), start: 0, columns: 3 },
            upLeft: { row: Math.min(2, 4 - 1), start: 0, columns: 3 },
            downLeft: { row: 0, start: 0, columns: 3 },
            hitbox: { widthPercentage: 50, heightPercentage: 50 },
            dialogues: ['Welcom traveler, to the ruins of Natlan! Below, you will find magical worlds that cannot exist but in your mind, treasure, and danger more than you have ever known. Press Esc, if you dare, and enter the realm below'],
            reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
            interact: function() { if (this.dialogueSystem) { this.showRandomDialogue(); } }
        };
this.classes = [      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: npcData1 }
];

        
    }
}

export default GameLevelRishabsfa3;