var dino = document.getElementById("dino");
var startMessage = document.getElementById("start-message");
var pauseMessage = document.getElementById("pause-message"); // Nuovo elemento per il messaggio di pausa
var scoreDisplay = document.createElement("div");
var isJumping = false;
var isDucking = false;
var gameStarted = false;
var isPaused = false; // Nuovo stato per la pausa
var score = 0;

var enemies = [];
var enemySpawnInterval;
var gameAnimationFrame;

// Impostazioni del punteggio
scoreDisplay.style.position = "absolute";
scoreDisplay.style.top = "5%";
scoreDisplay.style.left = "5%";
scoreDisplay.style.fontSize = "30px"; // Aumentato
scoreDisplay.innerText = "Punteggio: " + score;
document.getElementById("screen").appendChild(scoreDisplay);

// Posizione iniziale del dinosauro (sulla linea del terreno)
dino.style.bottom = "25px"; // Aumentato per la nuova altezza del terreno

// Elenco delle sprite del Dinosauro
const dinoRunSprites = ["trex1.png", "trex2.png", "trex3.png"];
var spriteCount = 0;
var dinoRunInterval;

// Classe per il salto e l'abbassamento
var jumpClass = "jump";
var duckClass = "dino-duck";

function jump() {
    if (isJumping || isDucking || isPaused) return; // Non saltare se già in salto, abbassato o in pausa
    isJumping = true;
    dino.classList.add(jumpClass);
    setTimeout(function () {
        dino.classList.remove(jumpClass);
        isJumping = false;
    }, 800); // Tempo di salto, deve corrispondere alla durata dell'animazione CSS
}

function duck() {
    if (isJumping || isDucking || isPaused) return; // Non abbassarsi se già in salto, abbassato o in pausa
    isDucking = true;
    dino.classList.add(duckClass);
}

function stopDucking() {
    if (!isDucking) return;
    isDucking = false;
    dino.classList.remove(duckClass);
}

function dinoRun() {
    dino.setAttribute("src", dinoRunSprites[spriteCount]);
    spriteCount = (spriteCount + 1) % dinoRunSprites.length;
}

function startGame() {
    if (!gameStarted && !isPaused) { // Inizia solo se non è già iniziato e non è in pausa
        gameStarted = true;
        startMessage.style.display = "none";
        dinoRunInterval = setInterval(dinoRun, 70);
        spawnEnemy();
        enemySpawnInterval = setInterval(spawnEnemy, Math.random() * (1500 - 700) + 700); // Intervallo di generazione più veloce
        gameAnimationFrame = requestAnimationFrame(gameLoop);
    }
}

function pauseGame() {
    if (!gameStarted || isPaused) return; // Può mettere in pausa solo se il gioco è iniziato e non è già in pausa
    isPaused = true;
    clearInterval(dinoRunInterval);
    clearInterval(enemySpawnInterval);
    cancelAnimationFrame(gameAnimationFrame);
    pauseMessage.style.display = "block"; // Mostra il messaggio di pausa
}

function resumeGame() {
    if (!gameStarted || !isPaused) return; // Può riprendere solo se il gioco è iniziato ed è in pausa
    isPaused = false;
    pauseMessage.style.display = "none"; // Nasconde il messaggio di pausa
    dinoRunInterval = setInterval(dinoRun, 70);
    // Reimposta l'intervallo di generazione dei nemici per evitare un ritardo eccessivo
    enemySpawnInterval = setInterval(spawnEnemy, Math.random() * (1500 - 700) + 700); // Intervallo di generazione più veloce
    gameAnimationFrame = requestAnimationFrame(gameLoop);
}


function spawnEnemy() {
    const newEnemy = document.createElement("img");
    newEnemy.classList.add("enemy-instance");

    const enemyType = Math.random() > 0.5 ? "cactus" : "bird";

    if (enemyType === "cactus") {
        newEnemy.src = "Cactus.png";
        newEnemy.style.height = "60px"; // Aumentato
        newEnemy.style.bottom = "25px"; // Posizione sul terreno (adattato alla nuova altezza del terreno)
    } else {
        newEnemy.src = "https://placehold.co/70x50/000/FFF?text=Bird"; // Aumentato
        newEnemy.style.height = "50px"; // Aumentato
        // Posizione verticale casuale per l'uccello (più in alto, adattato alle nuove dimensioni)
        newEnemy.style.bottom = (80 + Math.random() * 60) + "px"; // Tra 80px e 140px dal bottom
    }

    newEnemy.style.left = "100%";
    document.getElementById("screen").appendChild(newEnemy);
    enemies.push(newEnemy);
}

function gameLoop() {
    if (isPaused) return; // Ferma il loop se il gioco è in pausa

    // Muovi i nemici
    for (let i = 0; i < enemies.length; i++) {
        let currentEnemy = enemies[i];
        let currentLeftPx = parseFloat(window.getComputedStyle(currentEnemy).getPropertyValue("left"));
        let screenWidth = document.getElementById("screen").offsetWidth;
        let currentLeftPercent = (currentLeftPx / screenWidth) * 100;

        currentEnemy.style.left = (currentLeftPercent - 1.0) + "%"; // Velocità aumentata

        // Controlla se il nemico è fuori dallo schermo
        if (currentLeftPercent <= -10) {
            currentEnemy.remove();
            enemies.splice(i, 1);
            i--;
            score++;
            scoreDisplay.innerText = "Punteggio: " + score;
        }
    }

    // Controlla le collisioni per tutti i nemici
    if (checkCollision()) {
        endGame();
        return;
    }

    gameAnimationFrame = requestAnimationFrame(gameLoop);
}

function checkCollision() {
    var dinoRect = dino.getBoundingClientRect();
    
    for (let i = 0; i < enemies.length; i++) {
        var enemyRect = enemies[i].getBoundingClientRect();
        
        if (!(
            dinoRect.right < enemyRect.left ||
            dinoRect.left > enemyRect.right ||
            dinoRect.bottom < enemyRect.top ||
            dinoRect.top > enemyRect.bottom
        )) {
            return true; // Collisione rilevata
        }
    }
    return false;
}

function endGame() {
    showEndGameMessage("Hai perso! Punteggio finale: " + score);
    resetGame();
}

function showEndGameMessage(message) {
    const messageBox = document.createElement("div");
    messageBox.style.position = "absolute";
    messageBox.style.top = "50%";
    messageBox.style.left = "50%";
    messageBox.style.transform = "translate(-50%, -50%)";
    messageBox.style.backgroundColor = "white";
    messageBox.style.padding = "20px";
    messageBox.style.border = "2px solid black";
    messageBox.style.borderRadius = "10px";
    messageBox.style.zIndex = "1000";
    messageBox.style.textAlign = "center";
    messageBox.innerText = message;

    const closeButton = document.createElement("button");
    closeButton.innerText = "OK";
    closeButton.style.marginTop = "10px";
    closeButton.style.padding = "8px 15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.borderRadius = "5px";
    closeButton.style.border = "1px solid #ccc";
    closeButton.onclick = () => messageBox.remove();

    messageBox.appendChild(closeButton);
    document.getElementById("screen").appendChild(messageBox);
}


function resetGame() {
    gameStarted = false;
    isPaused = false; // Assicurati che il gioco non sia in pausa al reset
    clearInterval(dinoRunInterval);
    clearInterval(enemySpawnInterval);
    cancelAnimationFrame(gameAnimationFrame);

    enemies.forEach(enemy => enemy.remove());
    enemies = [];

    score = 0;
    scoreDisplay.innerText = "Punteggio: " + score;
    startMessage.style.display = "block";
    pauseMessage.style.display = "none"; // Nasconde il messaggio di pausa
    dino.classList.remove(duckClass);
    isDucking = false;
    isJumping = false;
    dino.style.bottom = "25px"; // Ripristina la posizione del dinosauro
}

// Gestore per i tasti premuti
document.addEventListener('keydown', function(event) {
    if (event.key === ' ' || event.key === 'ArrowUp') {
        if (!gameStarted) {
            startGame();
        }
        jump();
    } else if (event.key === 'ArrowDown') {
        if (!gameStarted) {
            startGame();
        }
        duck();
    } else if (event.key === 'p' || event.key === 'P') { // Tasto 'P' per pausa/ripresa
        if (gameStarted) {
            if (isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
    }
});

// Gestore per il rilascio del tasto (per l'abbassamento)
document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowDown') {
        stopDucking();
    }
});

// Gestore per il tocco su dispositivi mobili
document.getElementById('screen').addEventListener('touchstart', function(event) {
    event.preventDefault(); // Impedisce lo zoom o altri comportamenti indesiderati
    if (!gameStarted) {
        startGame();
    }
    jump();
});
