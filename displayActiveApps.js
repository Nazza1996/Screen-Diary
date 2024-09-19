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

async function newApp(appTitle, iconPath, appTime) {
    const appsContainer = document.getElementById('appsContainer');

    const appElement = document.createElement('div');
    appElement.classList.add('app');

    const iconElement = document.createElement('img');
    iconElement.classList.add('appIcon');
    iconElement.src = './assets/desktop.jpg';
    if (await window.electronAPI.imageExists(iconPath)) {
        iconElement.src = iconPath;
    } else {
        setTimeout(() => {
            iconElement.src = iconPath;
        }, 10000);
    }

    const titleElement = document.createElement('p');
    titleElement.classList.add('appTitle');
    titleElement.id = `${appTitle}-title`;
    titleElement.textContent = appTitle;

    const timeElement = document.createElement('p');
    timeElement.classList.add('appTime');
    timeElement.id = `${appTitle}-time`;
    timeElement.dataset.time = 0;
    if (appTime == 0) {
        timeElement.textContent = '0s';
    } else {
        timeElement.textContent = appTime;
    }

    appElement.appendChild(iconElement);
    appElement.appendChild(titleElement);
    appElement.appendChild(timeElement);
    appsContainer.appendChild(appElement);
}

function updateApp(appTitle, time) {
    const timeElement = document.getElementById(`${appTitle}-time`);
    timeElement.textContent = time;
}


async function displayApps() {
    let timestamp = {};
    let processTime = {};
    let formattedProcessTime = {};
    let screenTimeAppUptime = 0;
    let appData = {};

    
    if (await window.electronAPI.loadData()) {
        const loadedApps = Object.entries(await window.electronAPI.loadData());
        loadedApps.forEach(element => {
            let name = element[1].name;
            let time = formatTime(element[1].upTime);
            let iconPath = element[1].icon;
            newApp(name, iconPath, time);

            processTime[name] = element[1].upTime;
            timestamp[name] = (new Date().getTime() - element[1].upTime);
        });
    }

    sortApps();

    while (true) {
        const app = await window.electronAPI.getApps();
        const activeWindow = app.activeWindow;

        let appTitle = activeWindow.owner.name;
        appTitle = appTitle.replace('.exe', '');

        timestamp[appTitle] = new Date().getTime();
        await delay(1000);
        if (!processTime[appTitle]) {
            processTime[appTitle] = 0;
            await newApp(appTitle, app.iconPath);
        }
        processTime[appTitle] = processTime[appTitle] + (new Date().getTime() - timestamp[appTitle]);
        formattedProcessTime[appTitle] = formatTime(processTime[appTitle]);
        updateApp(appTitle, formattedProcessTime[appTitle]);
        screenTimeAppUptime++; 

        appData[appTitle] = activeWindow;
        appData[appTitle]["upTime"] = processTime[appTitle];

        const timeElement = document.getElementById(`${appTitle}-time`);
        timeElement.dataset.time = processTime[appTitle];

        if (screenTimeAppUptime % 10 == 0) {            
            await window.electronAPI.saveData(appData);
        };
        // sortApps();
    };
}

function sortApps() {
    const appsContainer = document.getElementById('appsContainer');
    const apps = Array.from(appsContainer.children);
    apps.sort((a, b) => {
        const timeA = Number(a.querySelector('.appTime').dataset.time);
        const timeB = Number(b.querySelector('.appTime').dataset.time);

        console.log(timeA);
        console.log(timeB);

        return timeB - timeA;
    });

    apps.forEach(app => appsContainer.appendChild(app));
}