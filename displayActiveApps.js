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

function newApp(appTitle) {
    const appsContainer = document.getElementById('appsContainer');

    const appElement = document.createElement('div');
    appElement.classList.add('app');
    const titleElement = document.createElement('p');
    titleElement.classList.add('appTitle');
    titleElement.id = `${appTitle}-title`;
    titleElement.textContent = appTitle;

    const timeElement = document.createElement('p');
    timeElement.classList.add('appTime');
    timeElement.id = `${appTitle}-time`;
    timeElement.textContent = '0s';

    appElement.appendChild(titleElement);
    appElement.appendChild(timeElement);
    appsContainer.appendChild(appElement);
}

function updateApp(appTitle, time) {
    const timeElement = document.getElementById(`${appTitle}-time`);
    timeElement.textContent = time;
}


async function displayApps() {

    let timestamp = [];
    let processTime = [];
    let formattedProcessTime = [];

    while (true) {
        const appTitle = await window.electronAPI.getApps();
        timestamp[appTitle] = new Date().getTime();
        await delay(1000);
        if (!processTime[appTitle]) {
            processTime[appTitle] = 0;
            newApp(appTitle);
        }
        processTime[appTitle] = processTime[appTitle] + (new Date().getTime() - timestamp[appTitle]);
        formattedProcessTime[appTitle] = formatTime(processTime[appTitle]);
        updateApp(appTitle, formattedProcessTime[appTitle]);
    }
}