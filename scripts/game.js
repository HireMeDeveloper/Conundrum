let timerStarted = false

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