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


async function main() {
    let timestamp = [];
    let processTime = [];
    let formattedProcessTime = [];

    while (true) {
        const activeWindow = activeWin.sync();
        const appTitle = activeWindow.owner.name;
        timestamp[appTitle] = new Date().getTime();
        await delay(1000);
        if (!processTime[appTitle]) {
            processTime[appTitle] = 0;
        }
        processTime[appTitle] = processTime[appTitle] + (new Date().getTime() - timestamp[appTitle]);
        formattedProcessTime[appTitle] = formatTime(processTime[appTitle]);
        console.log(formattedProcessTime);
    }
}

main();

