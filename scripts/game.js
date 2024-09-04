let timerStarted = false

let currentPuzzle = "BBAAAAAAA"
let currentWordSize = 9
let currentGuess = []
let currentKeys = []


const keyboard = document.querySelector("[data-keyboard]")
const guessboard = document.querySelector("[data-guessboard]")

function startTimer(startTime) {
    if (timerStarted) return

    timerStarted = true
    updateTimer(startTime * 100)
}

function updateTimer(totalHundredths) {
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

}

function pressButton(key) {
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

    if (currentGuess.join('') === currentPuzzle) {
        console.log("Correct")
    } else {
        console.log("Incorrect")
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
    keys.forEach(key => {
        key.classList.add("shake")
        key.addEventListener("animationend", () => {
            key.classList.remove("shake")
        }, { once: true })
    });
}