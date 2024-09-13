let gameHasStarted = false
let timerStarted = false

let gameState = {
    games: [
        {
            puzzle: "esintgt",
            solution: "Testing",
            hint: "Practicing Code",
            isWin: false,
            usedHint: false,
            wasStarted: false
        },
        {
            puzzle: "yiklcofc",
            solution: "Clockify",
            hint: "Time Keeping Platform",
            isWin: false,
            usedHint: false,
            wasStarted: false
        },
        {
            puzzle: "jpakelcap",
            solution: "Applejack",
            hint: "Fruity Cereal",
            isWin: false,
            usedHint: false,
            wasStarted: false
        }
    ],
    currentGame: 0,
    isComplete: false,
    gameNumber: 0,
    hasOpenedPuzzle: false
}

let cumulativeData = []

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
    let puzzles = targetGame.puzzles;

    gameState = {
        games: [
            {
                puzzle: puzzles[0].scrambled,
                solution: puzzles[0].word,
                hint: puzzles[0].hint,
                isWin: false,
                usedHint: false,
                wasStarted: false
            },
            {
                puzzle: puzzles[1].scrambled,
                solution: puzzles[1].word,
                hint: puzzles[1].hint,
                isWin: false,
                usedHint: false,
                wasStarted: false
            },
            {
                puzzle: puzzles[2].scrambled,
                solution: puzzles[2].word,
                hint: puzzles[2].hint,
                isWin: false,
                usedHint: false,
                wasStarted: false
            }
        ],
        currentGame: 0,
        isComplete: false,
        gameNumber: targetGame.number,
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
    updateTimer((30 + (10 * (currentWordSize - 7))) * 100, (30 + (10 * (currentWordSize - 7))) * 100)

    gameState.games[gameState.currentGame].wasStarted = true;
    storeGameStateData();

    updateCumulativeData()
}

function stopTimer() {
    timerStarted = false
}

function updateTimer(totalHundredths, maxTime) {
    if (timerStarted === false) return;

    let seconds = Math.floor(totalHundredths / 100);
    let hundredths = totalHundredths % 100;
    let formattedHundreds = (hundredths < 10) ? ((hundredths === 0) ? '00' : '0' + hundredths) : hundredths
    let formattedTime = `00:${(seconds < 10) ? '0' + seconds : seconds}`;

    drawCircle(totalHundredths / maxTime, formattedTime)

    //let timerText = document.querySelector('.text-timer')
    //timerText.textContent = formattedTime

    if (totalHundredths > 0) {
        setTimeout(() => {
            updateTimer(totalHundredths - 1, maxTime)
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

    updateCumulativeData()

    revealNextButton()
}

function revealNextButton() {
    stopInteraction()

    nextButton.onclick = null

    if (gameState.currentGame <= 1) {
        nextButton.textContent = "Play Next"
        nextButton.onclick = function () {
            playNext()
            fireEvent("play-next-game");
        }
    } else {
        gameState.isComplete = true;
        storeGameStateData()

        nextButton.textContent = "See Stats"
        nextButton.onclick = function () {
            showPage("stats")
            fireEvent("game-3-to-stats");
        }
    }

    nextButton.classList.remove('hidden')
}

function updateCumulativeData() {
    let games = 0;
    let wins = 0;
    let hints = 0;

    gameState.games.forEach(game => {
        if (game.wasStarted) games += 1;
        if (game.isWin) wins += 1;
        if (game.usedHint) hints += 1;
    })

    let hasEntry = cumulativeDataHasEntry(gameState.gameNumber)
    console.log("Has entry: " + hasEntry)

    if (hasEntry === false) {
        console.log("Pushing in new entry");

        cumulativeData.push({
            number: gameState.gameNumber,
            games: games,
            wins: wins,
            hints: hints
        })

        storeCumulativeData()
    } else {
        console.log("Updating old entry");

        let entryIndex = getCumulativeDataEntryIndex(gameState.gameNumber);

        cumulativeData[entryIndex] = {
            number: gameState.gameNumber,
            games: games,
            wins: wins,
            hints: hints
        }

        storeCumulativeData()
    }
}

function cumulativeDataHasEntry(gameNumber) {
    return cumulativeData.some(entry => {
        if (entry.number === gameNumber) {
            console.log("Found an equal number")
            return true;
        } else {
            console.log("Found no equal number")
            return false;
        }
    })
}

function getCumulativeDataEntryIndex(gameNumber) {
    const index = cumulativeData.findIndex(entry => entry.number === gameNumber);
    return index !== -1 ? index : null;
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
        currentGuess = currentGame.solution.split('')
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
                if (this.classList.contains('changed')) {
                    removeLast(currentLetter.toUpperCase())
                    this.classList.remove('changed')
                } else {
                    pressButton(currentLetter.toUpperCase())
                    this.classList.add('changed');
                }
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

function removeLast(char) {
    let outputKeys = getAllOutputKeys()
    let foundKey = null

    for (let i = outputKeys.length - 1; i >= 0; i--){
        let key = outputKeys[i];

        if (key.textContent === char) {
            foundKey = key;
            break;
        }
    }

    let keyIndex = Array.from(outputKeys).findIndex(key => key === foundKey);

    outputKeys.forEach((key, i) => {
        let next = (i === outputKeys.length - 1) ? null : outputKeys[i + 1];

        if (i >= keyIndex) {
            if (next != null) {
                key.textContent = next.textContent;
                if (next.hasAttribute("data-letter")) {
                    key.dataset.letter = next.dataset.letter
                } else {
                    delete key.dataset.letter;
                }
            } else {
                key.textContent = "";
                key.classList.remove('changed');
                delete key.dataset.letter;
                remapGuess();
            }
        }
    })
}

function remapGuess() {
    currentGuess = []
    currentKeys = []

    let outputKeys = getAllOutputKeys()

    outputKeys.forEach(key => {
        if (key.textContent != '') {
            currentGuess.push(key.textContent)
            currentKeys.push(key)
        }
    })

    console.log("New Guess: " + currentGuess)
}

function checkGuess() {
    console.log("guess was: " + currentGuess)

    if (currentGuess.join('').toLowerCase() === currentSolution.toLowerCase()) {
        win()
    } else {
        shakeKeys(currentKeys)
        resetGuess()
    }

    currentKeys = []
    currentGuess = []
}

function win() {
    getAllOutputKeys().forEach((key, i) => {
        key.classList.add('changed')
        key.textContent = gameState.games[gameState.currentGame].solution.toUpperCase()[i]
    })

    //showAlert("Correct", true, null)
    drawWinCircle()

    gameState.games[gameState.currentGame].isWin = true
    storeGameStateData()

    updateCumulativeData()

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
        key.classList.remove('changed')
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

    updateCumulativeData()
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