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
    iconElement.id = `${appTitle}-icon`;
    iconElement.src = './assets/desktop.jpg';
    if (await window.electronAPI.imageExists(iconPath)) {
        iconElement.src = iconPath;
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
        timeElement.textContent = formatTime(appTime);
        timeElement.dataset.time = appTime;
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

let appData = {};
let dailyAppData = [];

async function displayApps() {
    let timestamp = {};
    let processTime = {};
    let formattedProcessTime = {};
    let screenTimeAppUptime = 0;
    
    if (await window.electronAPI.loadData()) {
        const loadedApps = Object.entries(await window.electronAPI.loadData());
        loadedApps.forEach(element => {
            let name = element[1].name;
            let time = element[1].upTime;
            let iconPath = element[1].icon;
            let path = element[1].path;
            newApp(name, iconPath, time);

            dailyAppData.push({
                name: name,
                path: path,
                upTime: time,
                icon: iconPath
            });

            processTime[name] = element[1].upTime;
            timestamp[name] = (new Date().getTime() - element[1].upTime);
        });
    }

    setTimeout(() => {
        document.getElementById('appsContainer').style.display = '';
        document.getElementById('loadingText').style.display = 'none';
    }, 2000);

    sortApps();

    while (true) {
        try {
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

            if (app.isNewImage) {
                const iconElement = document.getElementById(`${appTitle}-icon`);
                iconElement.src = null;
                iconElement.src = app.iconPath;
            }

            processTime[appTitle] = processTime[appTitle] + (new Date().getTime() - timestamp[appTitle]);
            formattedProcessTime[appTitle] = formatTime(processTime[appTitle]);
            updateApp(appTitle, formattedProcessTime[appTitle]);
            screenTimeAppUptime++; 

            appData[appTitle] = activeWindow;
            appData[appTitle]["upTime"] = processTime[appTitle];

            if (dailyAppData.find((obj) => obj.name === appTitle)) {
                dailyAppData.find((obj) => obj.name === appTitle).upTime = processTime[appTitle];
            } else {
                dailyAppData.push({
                    name: appTitle,
                    path: activeWindow.owner.path,
                upTime: processTime[appTitle],
                    icon: app.iconPath
                });
            } 

            const timeElement = document.getElementById(`${appTitle}-time`);
            timeElement.dataset.time = processTime[appTitle];

            if (screenTimeAppUptime % 120 == 0) {            
                await window.electronAPI.saveData(dailyAppData);
            };
            sortApps();
        } catch (error) {}
    };
}

function sortApps() {
    const appsContainer = document.getElementById('appsContainer');
    const apps = Array.from(appsContainer.children);
    apps.sort((a, b) => {
        const timeA = Number(a.querySelector('.appTime').dataset.time);
        const timeB = Number(b.querySelector('.appTime').dataset.time);
        return timeB - timeA;
    });

    appsContainer.innerHTML = '';
    apps.forEach(app => appsContainer.appendChild(app));
}

window.electronAPI.receiveRequestFromMain((event) => {
    console.log("Requested");
    window.electronAPI.sendVariableToMain(dailyAppData);
});
