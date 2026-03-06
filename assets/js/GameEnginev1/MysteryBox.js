import Npc from './essentials/Npc.js';

class MysteryBox extends Npc {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
    }

    reaction() {
        alert("You found the Mystery Box! It moved!");
        this.position.x = Math.random() * (this.gameEnv.innerWidth - 100);
        this.position.y = Math.random() * (this.gameEnv.innerHeight - 100);
    }
}

export default MysteryBox;