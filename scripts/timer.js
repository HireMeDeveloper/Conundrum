function drawCircle(value, text) {
    const canvas = document.getElementById('circleCanvas');
    const ctx = canvas.getContext('2d');
    const radius = canvas.width * .45; // Radius of the circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#ccebe6'; // Fill color
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.closePath();

    // Draw the filled arc
    const offest = -Math.PI / 2
    const twoPI = (2 * Math.PI);
    const endAngle = ((1 - value) * (2 * Math.PI)); // Convert value to radians
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0 + endAngle + offest, twoPI + offest, false);
    ctx.strokeStyle = '#009982'; // Fill color
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.closePath();

    // Display the value in the center of the circle
    ctx.fillStyle = '#000';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY);
}

function drawWinCircle() {
    const canvas = document.getElementById('circleCanvas');
    const ctx = canvas.getContext('2d');
    const radius = canvas.width * .45; // Radius of the circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#FFFFFF'; // Fill color
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = '#D2DB5C'
    ctx.fill()

    // Display the value in the center of the circle
    ctx.fillStyle = '#000';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("You Win", centerX, centerY);
}