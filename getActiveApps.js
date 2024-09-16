const activeWin = require("active-win");


const delay = millis => new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), millis)
  });


function formatTime(millis) {
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime = '';

    if (hours > 0) {
        formattedTime += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes}m `;
    }
    formattedTime += `${seconds}s`;

    return formattedTime.trim();
}

