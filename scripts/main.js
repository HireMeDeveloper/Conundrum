const DATE_OF_FIRST_PUZZLE = new Date(2024, 6, 25)
const ALLOW_MOBILE_SHARE = true; 

const DICTIONARY_7LETTER = "resources/Dictionary-7Letter.csv";
const DICTIONARY_8LETTER = "resources/Dictionary-8Letter.csv";
const DICTIONARY_9LETTER = "resources/Dictionary-9Letter.csv";

const targetWordsLength = 100

const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const targetIndex = Math.floor(dayOffset + 0) % targetWordsLength
let targetGameNumber = targetIndex + 1
let targetGame = {}

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")
const shareButton = document.querySelector("[data-share-button]")
const playButton = document.querySelector("[data-play-button]")

const todaysStatisticGrid = document.querySelector("[data-statistics-today]");
const overallStatisticGrid = document.querySelector("[data-statistics-overall]");

let puzzleList = []

let canInteract = false;

window.dataLayer = window.dataLayer || [];

fetchCSV()

async function fetchCSV() {
    try {
        const responseCSV1 = await fetch(DICTIONARY_7LETTER);
        const csvText1 = await responseCSV1.text();
        let words7letter = parseCSV(csvText1);

        const responseCSV2 = await fetch(DICTIONARY_8LETTER);
        const csvText2 = await responseCSV2.text();
        let words8letter = parseCSV(csvText2);

        const responseCSV3 = await fetch(DICTIONARY_9LETTER);
        const csvText3 = await responseCSV3.text();
        let words9letter = parseCSV(csvText3);

        for (let i = 0; i < words7letter.length; i++){
            puzzleList.push({
                puzzles: [
                    words7letter[i],
                    words8letter[i],
                    words9letter[i],
                ],
                number: i + 1
            })
        }

        const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        let targetIndex = Math.floor(dayOffset + 0) % puzzleList.length
        targetGameNumber = targetIndex

        targetGame = puzzleList[targetIndex]

        fetchCumulativeData()
        fetchGameState()
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function parseCSV(data) {
    const lines = data.trim().split('\n');  // Split the input into lines and remove any trailing whitespace
    const result = [];

    for (let i = 1; i < lines.length; i++) {  // Start from 1 to skip the header row
        const [word, hint, scrambled] = lines[i].split(',');  // Split each line by commas

        result.push({
            word: word.trim(),         // Remove any surrounding whitespace from the word
            hint: hint.trim(),         // Remove any surrounding whitespace from the hint
            hint: "a wicked or evil person; someone who does evil deliberately",
            scrambled: scrambled.trim()  // Remove any surrounding whitespace from the scrambled word
        });
    }

    return result;
}

function showAlert(message, isWin = false, duration = 1000) {
    if (duration === null) {
        clearAlerts()
    }

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    
    if (isWin) alert.classList.add("win")
    else alert.classList.add("loss")
    
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function clearAlerts() {
    const alerts = document.querySelectorAll('.alert')

    alerts.forEach((alert) => {
        alert.remove()
    })
}

function showShareAlert(message, duration = 1000) {
    clearAlerts()

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")

    statsAlertContainer.append(alert)

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showPage(pageId, oldPage = null) {
    if (oldPage === null) {
        const page = document.querySelector('.page.active')
        if (page != null) {
            oldPage = page.id
        } else {
            oldPage = "game"
        }
    }

    if (pageId != "welcome" && pageId != "game" && pageId != "info" && pageId != "stats") {
        console.log("Invalid page: " + pageId + ". Openning 'game' page.")
        pageId = "game"
    }

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game") {
        updateBodyColor(true)
        openGame()
    }
    else if (pageId === "stats") {
        updateBodyColor(false)
        updateAllStats()
    } else if (pageId === "welcome") {
        updateBodyColor(false)
        generateWelcomeMessage()
    } else if (pageId === "info") {
        updateBodyColor(false)
        updateInfoPage()
    }

    if (oldPage != null) lastPage = oldPage
}

function updateBodyColor(isWhite) {
    document.body.classList.remove('white')
    document.body.classList.remove('off-white')

    document.body.classList.add((isWhite) ? 'white' : 'off-white')
}

function startInteraction() {
    document, addEventListener("keydown", handleKeyPress)

    canInteract = true
}

function stopInteraction() {
    canInteract = false
}

function storeGameStateData() {
    localStorage.setItem("conundrumGameState", JSON.stringify(gameState))
}

function storeCumulativeData() {
    localStorage.setItem("conundrumCumulativeData", JSON.stringify(cumulativeData))
}

function fetchGameState() {
    const localStateJSON = localStorage.getItem("conundrumGameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        if (localGameState.gameNumber === (targetGameNumber + 1)) {
            gameState = localGameState
        } else {
            console.log("Game state was reset since puzzle does not match: " + localGameState.gameNumber + " & " + targetGameNumber)
            resetGameState()
        }
    } else {
        console.log("Game state was reset since localStorage did not contain 'conundrumGameState'")
        resetGameState()
    }

    updateCumulativeData()

    if (gameState.hasOpenedPuzzle === true || gameState.games[gameState.currentGame].wasStarted === true) {
        loadPuzzleFromState(gameState.currentGame)
        showPage("welcome")
    } else {
        loadPuzzle(gameState.currentGame)
        showPage('info')
        
    }
}

function fetchCumulativeData() {
    const localStoreJSON = localStorage.getItem("conundrumCumulativeData")
    if (localStoreJSON != null) {
        console.log("Cumulative Data was Found: " + localStoreJSON)
        cumulativeData = JSON.parse(localStoreJSON)
        storeCumulativeData()
    } else {
        console.log("Cumulative Data was reset")
        resetCumulativeData()
    }
}

function resetCumulativeData() {
    cumulativeData = []
    storeCumulativeData()
}

function generateWelcomeMessage() {
    console.log("generating message")

    const welcomeHeader = document.querySelector("[data-welcome-header]")
    const welcomeMessage = document.querySelector("[data-welcome-message]")
    const welcomeButton = document.querySelector("[data-welcome-button]")
    const welcomeDate = document.querySelector("[data-welcome-date]")
    const welcomeNumber = document.querySelector("[data-welcome-number]")

    if (gameState.isComplete != true) {
        welcomeHeader.textContent = "Welcome Back"
        welcomeMessage.innerHTML = "Click below to finish todays game."
        welcomeMessage.classList.add('long')
        welcomeButton.textContent = "Continue"
        welcomeButton.onclick = () => {
            showPage('game')
            fireEvent("continue-game")
        }
    } else {
        welcomeHeader.textContent = "Hello"
        welcomeMessage.innerHTML = "There will be another <br> Conundrum tomorrow.<br> See you then!"
        welcomeMessage.classList.remove('long')
        welcomeButton.textContent = "See Stats"
        welcomeButton.onclick = () => {
            showPage('stats')
            fireEvent("from-welcome-to-stats")
        }
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth();
    let dd = today.getDate();

    let months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]

    if (dd < 10) dd = '0' + dd;

    const formattedToday = months[mm] + " " + dd + ", " + yyyy
    welcomeDate.textContent = formattedToday

    welcomeNumber.textContent = "No. " + (targetIndex + 1)
}

function updateInfoPage() {
    if (gameState.games[0].wasStarted === false) {
        playButton.textContent = "Play"
        playButton.onclick = function () {
            showPage("game")
            fireEvent("play-game")
        } 
    } else {
        playButton.textContent = "Continue"
        playButton.onclick = function () {
            showPage("game")
        } 
    }
}

function processStats(cumulativeState) {
    let result = {
        today: {
            streak: 0,
            gamesPlayed: 0,
            wins: 0,
            hints: 0,
            countedHints: 0,
            gradeText: "N/A"
        },
        overall: {
            daysPlayed: cumulativeState.length,
            gamesPlayed: 0,
            wins: 0,
            hints: 0,
            countedHints: 0,
            gradeText: "N/A"
        }
    }

    cumulativeState.forEach((entry, i) => {
        let lastEntry = null
        if (i !== 0) {
            lastEntry = cumulativeState[i - 1];
        }

        let isNext = true;
        if (lastEntry !== null) {
            let currentNumber = Number(entry.number)
            let lastNumber = Number(lastEntry.number)
            isNext = (currentNumber === (lastNumber + 1))

            //console.log("Current Number: " + currentNumber + " LastNumber: " + lastNumber + " isNext: " + isNext)
        }

        if (isNext) {
            result.today.streak += 1
        } else {
            result.today.streak = 1
        }

        if (i === (cumulativeState.length - 1)) {
            result.today.gamesPlayed += entry.games;
            result.today.wins += entry.wins;
            result.today.hints += entry.hints;
            result.today.countedHints += entry.countedHints
        }

        result.overall.gamesPlayed += entry.games;
        result.overall.wins += entry.wins;
        result.overall.hints += entry.hints;
        result.overall.countedHints += entry.countedHints
    })

    if (result.today.gamesPlayed > 0) {
        let grade = getGrade(result.today.gamesPlayed, result.today.wins, result.today.countedHints)
        result.today.gradeText = grade + "%"
    }

    if (result.overall.gamesPlayed > 0) {
        let overallGrade = getGrade(result.overall.gamesPlayed, result.overall.wins, result.overall.countedHints)
        result.overall.gradeText = overallGrade + "%"
    }

    return result;
}

function updateAllStats() {
    const results = processStats(cumulativeData)

    updateStats(todaysStatisticGrid, results.today.streak, results.today.gamesPlayed, results.today.wins, results.today.hints, results.today.gradeText)
    updateStats(overallStatisticGrid, results.overall.daysPlayed, results.overall.gamesPlayed, results.overall.wins, results.overall.hints, results.overall.gradeText)
}

function updateStats(statsGrid, daysPlayed, games, wins, hintsUsed, grade) {
    let statisticsArray = Array.from(statsGrid.querySelectorAll('.statistic'));

    const daysPlayedData = statisticsArray[0].querySelector('.statistic-data');
    const gamesData = statisticsArray[1].querySelector('.statistic-data');
    const winsData = statisticsArray[2].querySelector('.statistic-data');
    const hintsData = statisticsArray[3].querySelector('.statistic-data');
    const gradeData = statisticsArray[4].querySelector('.statistic-data');

    daysPlayedData.textContent = daysPlayed
    gamesData.textContent = games
    winsData.textContent = wins
    hintsData.textContent = hintsUsed
    gradeData.textContent = grade
}

function getGrade(games, wins, hints) {
    let grade = (((100 * wins) - (10 * hints)) / games)
    grade = Math.round(grade).toFixed(0)
    console.log("Games: " + games + " Wins: " + wins + " Hints: " + hints + "Grade: " + grade);

    return grade;
}

function pressShare() {
    if (gameState.isComplete == false) {
        showShareAlert("Complete todays puzzle to share!")
        return;
    }

    let lastEntry = cumulativeData[cumulativeData.length - 1]
    let grade = getGrade(lastEntry.games, lastEntry.wins, lastEntry.countedHints)

    let textToCopy = "Try Conundrum! \nwww.independent.ie/conundrum \n Puzzle: " + targetGame.number + " " + "\n" + " My score today: " + grade + "% \n" 

    //"🟩🟥"

    textToCopy += (gameState.games[0].isWin) ? (gameState.games[0].usedHint) ? "\n🟨🟨🟨🟨🟨🟨🟨" : "\n🟩🟩🟩🟩🟩🟩🟩" : "\n🟥🟥🟥🟥🟥🟥🟥"
    textToCopy += (gameState.games[1].isWin) ? (gameState.games[1].usedHint) ? "\n🟨🟨🟨🟨🟨🟨🟨🟨" : "\n🟩🟩🟩🟩🟩🟩🟩🟩" : "\n🟥🟥🟥🟥🟥🟥🟥🟥"
    textToCopy += (gameState.games[2].isWin) ? (gameState.games[2].usedHint) ? "\n🟨🟨🟨🟨🟨🟨🟨🟨🟨" : "\n🟩🟩🟩🟩🟩🟩🟩🟩🟩" : "\n🟥🟥🟥🟥🟥🟥🟥🟥🟥"

    if (navigator.share && detectTouchscreen() && ALLOW_MOBILE_SHARE) {
        navigator.share({
            text: textToCopy
        })
    } else {
        navigator.clipboard.writeText(textToCopy)
        showShareAlert("Link Copied! Share with Your Friends!")
    }

    fireEvent("pressed-share");
}

function detectTouchscreen() {
    var result = false
    if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
        if (navigator.maxTouchPoints > 0) {
            result = true
        }
    } else {
        if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
            result = true
        } else if (window.TouchEvent || ('ontouchstart' in window)) {
            result = true
        }
    }
    return result
}

function fireEvent(eventName) {
    const event = new CustomEvent(eventName)

    document.dispatchEvent(event)
    pushEventToDataLayer(event)

    console.log("EVENT: " + eventName)
}

function pushEventToDataLayer(event) {
    const eventName = event.type
    const eventDetails = event.detail

    window.dataLayer.push({
        'event': eventName,
        ...eventDetails
    })

    console.log(window.dataLayer)
}