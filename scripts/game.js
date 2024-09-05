let timerStarted = false

let currentPuzzle = "BBAAAAAAA"
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
    showAlert(currentPuzzle, false, null)
    stopInteraction()

    nextButton.classList.remove('hidden')
}

function loadPuzzle(puzzle) {
    currentPuzzle = puzzle;
    currentWordSize = puzzle.length

    const inputKeys = getAllInputKeys()
    const outputKeys = getAllOutputKeys()

    nextButton.classList.add('hidden')

    inputKeys.forEach((key, i) => {
        let currentLetter = puzzle.charAt(i)
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

    if (currentGuess.join('').toLowerCase() === currentPuzzle.toLowerCase()) {
        showAlert("Correct", true, null)
        stopTimer()

        nextButton.classList.remove('hidden')
        stopInteraction()
    } else {
        shakeKeys(currentKeys)
    }

    currentKeys.forEach(key => {
        key.textContent = '';
        delete key.dataset.letter;
    })

    currentKeys = []
    currentGuess = []
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

function pressHint() {
    if (canInteract === false) return;
    if (hintButton.classList.contains('changed')) return

    hintButton.classList.add('changed')
    hintText.classList.remove('hidden')
    hintText.textContent = "Sample Hint"
}

function playNext() {
    clearAlerts()

    loadPuzzle("testing")
    timerStarted = false;
    
    startTimer()
}