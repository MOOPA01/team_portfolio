---
layout: opencs
title: H.E.I.S.T.EXE
permalink: /heist
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-game.css">
<link rel="stylesheet" href="{{site.baseurl}}/assets/js/GameEnginev1.1/heist/heist-leaderboard.css">

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <canvas id='gameCanvas'></canvas>
</div>

<script type="module">

    // H.E.I.S.T.EXE Game level imports
    import Game from "{{site.baseurl}}/assets/js/GameEnginev1.1/essentials/Game.js";
    import HeistLevel1 from "{{site.baseurl}}/assets/js/GameEnginev1.1/HeistLevel1.js";
    import HeistLevel2 from "{{site.baseurl}}/assets/js/GameEnginev1.1/HeistLevel2.js";
    import HeistLevel3 from "{{site.baseurl}}/assets/js/GameEnginev1.1/HeistLevel3.js";
    import HeistLevel4 from "{{site.baseurl}}/assets/js/GameEnginev1.1/HeistLevel4.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    const gameLevelClasses = [ HeistLevel1, HeistLevel2, HeistLevel3, HeistLevel4 ];

    // Game Environment data
    const environment = {
        path:"{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameCanvas: document.getElementById("gameCanvas"),
        gameLevelClasses: gameLevelClasses
    }

    // Launch H.E.I.S.T.EXE Game
    const game = Game.main(environment);

</script>
