import Npc from './essentials/Npc.js';

class MysteryBox extends Npc {
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        this.isOpen = false;
    }

    reaction() {
        if (this.isOpen) {
            return; // Do nothing if already open
        }

        // Change the state to open
        this.isOpen = true;

        // Change the sprite to the 'open' state
        this.direction = 'open';

        alert("You opened the Mystery Box!");
    }
}

export default MysteryBox;