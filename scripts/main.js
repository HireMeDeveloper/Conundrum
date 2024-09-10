const DATE_OF_FIRST_PUZZLE = new Date(2024, 6, 25)
const ALLOW_MOBILE_SHARE = true; 

const targetWordsLength = 100

const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const targetIndex = Math.floor(dayOffset + 0) % targetWordsLength
const targetGameNumber = targetIndex + 1
let targetGame = {}

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")
const shareButton = document.querySelector("[data-share-button]")

const todaysStatisticGrid = document.querySelector("[data-statistics-today]");
const overallStatisticGrid = document.querySelector("[data-statistics-overall]");

const DICTIONARY_7LETTER = "resources/Dictionary-7Letter.csv";
const DICTIONARY_8LETTER = "resources/Dictionary-8Letter.csv";
const DICTIONARY_9LETTER = "resources/Dictionary-9Letter.csv";

let puzzleList = []

let canInteract = false;

fetchCSV()

async function fetchCSV() {
    try {
        const responseCSV1 = await fetch(DICTIONARY_7LETTER);
        const csvText1 = await responseCSV1.text();
        let words7letter = parseCSV(csvText1);

        //const responseCSV2 = await fetch(DICTIONARY_8LETTER);
        //const csvText2 = await responseCSV2.text();
        //let words8letter = parseCSV(csvText2);

        //const responseCSV3 = await fetch(DICTIONARY_9LETTER);
        //const csvText3 = await responseCSV3.text();
        //let words9letter = parseCSV(csvText3);

        words7letter.forEach((puzzle, i) => {
            puzzleList.push({
                puzzles: [
                    puzzle,
                    {
                        word: "clockify",
                        hint: "time keeping platfrom",
                        scrambled: "yfoccilk"
                    },
                    {
                        word: "applejack",
                        hint: "fruity cereal",
                        scrambled: "lepapkacj"
                    }
                ],
                number: i + 1
            })
        })

        const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        const targetIndex = Math.floor(dayOffset + 0) % puzzleList.length

        targetGame = puzzleList[targetIndex]

        fetchGameState()
        fetchCumulativeData()
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function parseCSV(data) {
    const lines = data.trim().split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) { // Start from 1 to skip the header
        const [word, hint, scrambled, count, random] = lines[i].split(',');

        result.push({
            word: word.trim(),
            hint: hint.trim(),
            scrambled: scrambled.trim()
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
        openGame()
    }
    else if (pageId === "stats") {
        updateAllStats()
    } else if (pageId === "welcome") {
        generateWelcomeMessage()
    } else if (pageId === "info") {

    }

    if (oldPage != null) lastPage = oldPage
}

function startInteraction() {
    canInteract = true
}

function stopInteraction() {
    canInteract = false
}

function storeGameStateData() {
    localStorage.setItem("conundrumGameState", JSON.stringify(gameState))

    updateCumulativeData()
}

function storeCumulativeData() {
    localStorage.setItem("conundrumCumulativeData", JSON.stringify(cumulativeData))
}

function fetchGameState() {
    const localStateJSON = localStorage.getItem("conundrumGameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        if (localGameState.gameNumber === targetGameNumber) {
            gameState = localGameState
        } else {
            console.log("Game state was reset since puzzle does not match")
            resetGameState()
        }
    } else {
        console.log("Game state was reset since localStorage did not contain 'conundrumGameState'")
        resetGameState()
    }

    updateCumulativeData()

    if (gameState.hasOpenedPuzzle === true) {
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
        cumulativeData = JSON.parse(localStoreJSON)
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
        welcomeMessage.textContent = "Click below to finish todays game."
        welcomeButton.textContent = "Continue"
        welcomeButton.onclick = () => {
            showPage('game')
        }
    } else {
        welcomeHeader.textContent = "Hello!"
        welcomeMessage.textContent = "There will be another Conundrum tomorrow. See you then!"
        welcomeButton.textContent = "See Stats"
        welcomeButton.onclick = () => {
            showPage('stats')
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

function updateAllStats() {
    let daysPlayed = 1;
    let gamesPlayed = 0;
    let wins = 0;
    let hints = 0;
    let gradeText = "N/A";

    gameState.games.forEach(game => {
        if (game.wasStarted) gamesPlayed += 1;
        if (game.isWin) wins += 1;
        if (game.usedHint) hints += 1;
    })

    if (gamesPlayed > 0) {
        let grade = getGrade(gamesPlayed, wins, hints)
        gradeText = grade + "%"
    }

    updateStats(todaysStatisticGrid, daysPlayed, gamesPlayed, wins, hints, gradeText)

    let totalDaysPlayed = cumulativeData.length;
    let totalGamesPlayed = 0;
    let totalWins = 0;
    let totalHints = 0;
    let overallGradeText = "N/A"

    cumulativeData.forEach((entry, i) => {
        if (i === (cumulativeData.length - 1)) {
            totalGamesPlayed += gamesPlayed;
            totalWins += wins;
            totalHints += hints;
            return;
        }

        totalGamesPlayed += entry.games;
        totalWins += entry.wins;
        totalHints += entry.hints;
    })

    if (totalGamesPlayed > 0) {
        let overallGrade = getGrade(totalGamesPlayed, totalWins, totalHints)
        overallGradeText = overallGrade + "%"
    }

    updateStats(overallStatisticGrid, totalDaysPlayed, totalGamesPlayed, totalWins, totalHints, overallGradeText)
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
    return (((5 * wins) - hints) / (games * 5)) * 100;
}

function pressShare() {
    if (gameState.isComplete == false) {
        showShareAlert("Complete todays puzzle to share!")
        return;
    }

    let lastEntry = cumulativeData[cumulativeData.length - 1]
    let grade = getGrade(lastEntry.wins, lastEntry.hints)

    let textToCopy = "Try Conundrum! No. " + targetGame.number + " " + "\n" + " My Grade was " + grade + "%" 

    if (navigator.share && detectTouchscreen() && ALLOW_MOBILE_SHARE) {
        navigator.share({
            text: textToCopy
        })
    } else {
        navigator.clipboard.writeText(textToCopy)
        showShareAlert("Link Copied! Share with Your Friends!")
    }
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