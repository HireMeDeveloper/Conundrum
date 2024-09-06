let gameHasStarted = false
let timerStarted = false

let gameState = {
    games: [
        {
            puzzle: "esintgt",
            solution: "Testing",
            hint: "Practicing Code",
            isWin: false,
            usedHint: false
        },
        {
            puzzle: "yiklcofc",
            solution: "Clockify",
            hint: "Time Keeping Platform",
            isWin: false,
            usedHint: false
        },
        {
            puzzle: "jpakelcap",
            solution: "Applejack",
            hint: "Fruity Cereal",
            isWin: false,
            usedHint: false
        }
    ],
    currentGame: 0,
    isComplete: false,
    gameNumber: 0,
    hasOpenedPuzzle: false
}

let currentPuzzle = ""
let currentSolution = ""
let currentHint = ""
let currentWordSize = 9
let currentGuess = []
let currentKeys = []

const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const keyboard = document.querySelector("[data-keyboard]")
const guessboard = document.querySelector("[data-guessboard]")
const hintButton = document.querySelector("[data-hint-button]")
const hintText = document.querySelector("[data-hint-text]")
const nextButton = document.querySelector("[data-next-button]")
const gameText = document.querySelector("[data-game-text]")

function loadGame() {
    
}

function resetGameState() {
    gameState = {
        games: [
            {
                puzzle: "esintgt",
                solution: "Testing",
                hint: "Practicing Code",
                isWin: false,
                usedHint: false
            },
            {
                puzzle: "yiklcofc",
                solution: "Clockify",
                hint: "Time Keeping Platform",
                isWin: false,
                usedHint: false
            },
            {
                puzzle: "jpakelcap",
                solution: "Applejack",
                hint: "Fruity Cereal",
                isWin: false,
                usedHint: false
            }
        ],
        currentGame: 0,
        isComplete: false,
        gameNumber: targetGameNumber,
        hasOpenedPuzzle: false
    }

    storeGameStateData()
}

function openGame() {
    if (gameState.isComplete) {
        loadPuzzleFromState(gameState.currentGame)
    }

    if (gameState.hasOpenedPuzzle === false) startTimer()

    if (gameState.hasOpenedPuzzle === false) {
        gameState.hasOpenedPuzzle = true;
        storeGameStateData()
    }

    if (gameHasStarted) return
    gameHasStarted = true;
}

function startTimer() {
    if (timerStarted) return

    startInteraction()

    timerStarted = true
    updateTimer((30 + (10 * (currentWordSize - 7))) * 100)
}

function stopTimer() {
    timerStarted = false
}

function updateTimer(totalHundredths) {
    if (timerStarted === false) return;

    let seconds = Math.floor(totalHundredths / 100);
    let hundredths = totalHundredths % 100;
    let formattedTime = `${seconds}:${hundredths < 10 ? '0' + hundredths : hundredths}`;

    let timerText = document.querySelector('.text-timer')
    timerText.textContent = formattedTime

    if (totalHundredths > 0) {
        setTimeout(() => {
            updateTimer(totalHundredths - 1)
        }, 10)
    } else {
        timerEnd()
    }
}

function timerEnd() {
    showAlert(currentSolution, false, null)
    timerStarted = false

    gameState.games[gameState.currentGame].isWin = false
    storeGameStateData()

    revealNextButton()
}

function revealNextButton() {
    stopInteraction()

    nextButton.onclick = null

    if (gameState.currentGame <= 1) {
        nextButton.textContent = "Play Next"
        nextButton.onclick = function () {
            playNext()
        }
    } else {
        gameState.isComplete = true;
        storeGameStateData()

        nextButton.textContent = "See Stats"
        nextButton.onclick = function () {
            showPage("stats")
        }
    }

    nextButton.classList.remove('hidden')
}

function loadPuzzleFromState(index) {
    loadPuzzle(index)
    if (gameState.currentGame >= 2) {
        gameState.isComplete = true;
        storeGameStateData()
    } 

    let currentGame = gameState.games[gameState.currentGame]

    if (currentGame.usedHint) {
        activateHint()
    }

    if (currentGame.isWin) {
        currentGuess = currentGame.solution
        checkGuess()
    } else {
        timerEnd()
    }

}

function loadPuzzle(index) {
    const activeGame = gameState.games[index]
    gameState.currentGame = index
    storeGameStateData()

    currentPuzzle = activeGame.puzzle;
    currentSolution = activeGame.solution
    currentHint = activeGame.hint
    currentWordSize = currentPuzzle.length

    const inputKeys = getAllInputKeys()
    const outputKeys = getAllOutputKeys()

    nextButton.classList.add('hidden')

    inputKeys.forEach((key, i) => {
        let currentLetter = currentPuzzle.charAt(i)
        let outputKey = outputKeys[i]

        if (i < currentWordSize) {
            key.classList.remove('hidden')
            key.classList.remove('changed')

            outputKey.classList.remove('hidden')

            key.onclick = function () {
                if (canInteract === false) return;
                if (this.classList.contains('changed')) return;

                pressButton(currentLetter.toUpperCase())
                this.classList.add('changed');
            }

            key.textContent = currentLetter.toUpperCase();
        } else {
            key.classList.add('hidden')
            outputKey.classList.add('hidden')

            key.onclick = null
        }
    })

    updateGameText()
}

function getAllInputKeys() {
    return keyboard.querySelectorAll('*');
}

function getAllOutputKeys() {
    return guessboard.querySelectorAll('*');
}

function pressButton(key) {
    if (canInteract === false) return;

    const nextKey = guessboard.querySelector(":not([data-letter])")
    nextKey.dataset.letter = key.toLowerCase()
    nextKey.textContent = key.toUpperCase()

    currentGuess.push(key)
    currentKeys.push(nextKey)
    console.log(currentGuess)

    if (currentGuess.length === currentWordSize) checkGuess()
}

function checkGuess() {
    console.log(currentGuess)

    if (currentGuess.join('').toLowerCase() === currentSolution.toLowerCase()) {
        win()
    } else {
        shakeKeys(currentKeys)
        resetGuess()
    }

    currentKeys = []
    currentGuess = []
}

function win(){
    showAlert("Correct", true, null)
    gameState.games[gameState.currentGame].isWin = true
    storeGameStateData()

    stopTimer()

    revealNextButton()
}

function shakeKeys(keys) {
    const inputKeys = getAllInputKeys()

    keys.forEach((key, i) => {
        key.classList.add("shake")
        key.addEventListener("animationend", () => {
            key.classList.remove("shake")

            inputKeys[i].classList.remove('changed')
        }, { once: true })
    });
}

function clearGuess() {
    if (timerStarted) resetGuess()
}

function resetGuess() {
    let currentKeys = getAllOutputKeys()
    let inputKeys = getAllInputKeys()

    inputKeys.forEach(key => {
        key.classList.remove('changed')
    })

    currentKeys.forEach(key => {
        key.textContent = '';
        delete key.dataset.letter;
    })

    currentKeys = []
    currentGuess = []
}

function pressHint() {
    if (canInteract === false) return;
    if (hintButton.classList.contains('changed')) return

    hintButton.classList.add('changed')
    hintText.classList.remove('hidden')
    hintText.textContent = currentHint

    gameState.games[gameState.currentGame].usedHint = true
    storeGameStateData()
}

function activateHint() {
    hintButton.classList.add('changed')
    hintText.classList.remove('hidden')
    hintText.textContent = currentHint

    gameState.games[gameState.currentGame].usedHint = true
    storeGameStateData()
}

function playNext() {
    clearAlerts()
    resetGuess()

    hintButton.classList.remove('changed')
    hintText.classList.add('hidden')

    const currentGameNumber = gameState.currentGame
    loadPuzzle(currentGameNumber + 1)
    timerStarted = false;
    
    startTimer()
}

function updateGameText() {
    gameText.textContent = (gameState.currentGame + 1) + " of 3"
}