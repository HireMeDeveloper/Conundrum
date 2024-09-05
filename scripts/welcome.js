generateWelcomeMessage()

function generateWelcomeMessage() {
    const welcomeHeader = document.querySelector("[data-welcome-header]")
    const welcomeMessage = document.querySelector("[data-welcome-message]")
    const welcomeButton = document.querySelector("[data-welcome-button]")
    const welcomeDate = document.querySelector("[data-welcome-date]")
    const welcomeNumber = document.querySelector("[data-welcome-number]")

    const gameState = {
        progress: "in-progress"
    }

    if (gameState.progress === "in-progress") {
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