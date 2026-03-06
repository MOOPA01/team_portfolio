---
layout: opencs
title: Coconut Game 
permalink: /gamify/coconut
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <canvas id='gameCanvas'></canvas>
</div>

<script type="module">

    // Adventure Game assets locations
    import Game from "/assets/js/GameEnginev1/essentials/Game.js";
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1/essentials/GameControl.js";
    import coconutL0 from "{{site.baseurl}}/assets/js/coconutGame/coconutL0.js";
    import coconutL1 from "{{site.baseurl}}/assets/js/coconutGame/coconutL1.js";
    import coconutL2 from "{{site.baseurl}}/assets/js/coconutGame/coconutL2.js";
    import coconutL3 from "{{site.baseurl}}/assets/js/coconutGame/coconutL3.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    const gameLevelClasses = [coconutL0, coconutL1, coconutL2, coconutL3];

    // Web Server Environment datas
    const environment = {
        path: "{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameCanvas: document.getElementById("gameCanvas"),
        gameLevelClasses: gameLevelClasses,
        // Game UI configuration
        gameUI: {
            showNavigation: true,
            showLevelSelect: true,
            showInfo: true,
            homeUrl: "/gamify/coconut",
            gameInfo: {
                title: "Coconut Game",
                version: "1.0",
                developer: "DNHS CSSE Feb 2029",
                controls: "Use WASD keys to move your character."
            }
        }
    }

    // Launch Adventure Game
    const game = Game.main(environment);
</script>