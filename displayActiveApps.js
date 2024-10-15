// Function to create a delay for a specified number of milliseconds
const delay = millis => new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), millis); // Resolve the promise after the delay
});

// Function to format time from milliseconds to a human-readable string
function formatTime(millis) {
    const totalSeconds = Math.floor(millis / 1000); // Convert milliseconds to total seconds
    const hours = Math.floor(totalSeconds / 3600); // Calculate hours
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Calculate minutes
    const seconds = totalSeconds % 60; // Calculate seconds

    let formattedTime = '';

    if (hours > 0) {
        formattedTime += `${hours}h `; // Add hours to the formatted time if greater than 0
    }
    if (minutes > 0 || hours > 0) {
        formattedTime += `${minutes}m `; // Add minutes to the formatted time if greater than 0
    }
    formattedTime += `${seconds}s`; // Add seconds to the formatted time

    return formattedTime.trim(); // Return the trimmed formatted time
}

// Function to create a new app element and add it to the apps container
async function newApp(appTitle, iconPath, appTime) {
    const appsContainer = document.getElementById('appsContainer'); // Get the apps container element

    const appElement = document.createElement('div'); // Create a new div element for the app
    appElement.classList.add('app'); // Add the 'app' class to the app element

    const iconElement = document.createElement('img'); // Create a new img element for the app icon
    iconElement.classList.add('appIcon'); // Add the 'appIcon' class to the icon element
    iconElement.id = `${appTitle}-icon`; // Set the id of the icon element
    iconElement.src = './assets/desktop.jpg'; // Set a default icon source
    if (await window.electronAPI.imageExists(iconPath)) {
        iconElement.src = iconPath; // Set the icon source if the image exists
    }

    const titleElement = document.createElement('p'); // Create a new p element for the app title
    titleElement.classList.add('appTitle'); // Add the 'appTitle' class to the title element
    titleElement.id = `${appTitle}-title`; // Set the id of the title element
    titleElement.textContent = appTitle; // Set the text content of the title element

    const timeElement = document.createElement('p'); // Create a new p element for the app time
    timeElement.classList.add('appTime'); // Add the 'appTime' class to the time element
    timeElement.id = `${appTitle}-time`; // Set the id of the time element
    timeElement.dataset.time = 0; // Initialize the data-time attribute to 0
    if (appTime == 0) {
        timeElement.textContent = '0s'; // Set the text content to '0s' if appTime is 0
    } else {
        timeElement.textContent = formatTime(appTime); // Set the formatted app time
        timeElement.dataset.time = appTime; // Set the data-time attribute to appTime
    }

    appElement.appendChild(iconElement); // Append the icon element to the app element
    appElement.appendChild(titleElement); // Append the title element to the app element
    appElement.appendChild(timeElement); // Append the time element to the app element
    appsContainer.appendChild(appElement); // Append the app element to the apps container
}

// Function to update the time of an existing app element
function updateApp(appTitle, time) {
    const timeElement = document.getElementById(`${appTitle}-time`); // Get the time element by id
    timeElement.textContent = time; // Update the text content of the time element
}

// Function to round down a number to a specified precision (1 for 10, 2 for 100, etc.)
function roundDown(num, precision) {
    const factor = Math.pow(10, precision); // Calculate the factor based on the precision
    return Math.trunc(num / factor) * factor; // Round down the number to the specified precision and return it
}

// Initialize app data and daily app data
let appData = {};
let dailyAppData = [];
let screenTimeAppUptime = 1000; // Initialize screen time app uptime

// Function to display active apps
async function displayApps() {
    let processTime = {}; // Initialize process time object
    let formattedProcessTime = {}; // Initialize formatted process time object
    
    // Load and display previously saved app data
    if (await window.electronAPI.loadData()) {
        const loadedApps = Object.entries(await window.electronAPI.loadData()); // Load saved app data
        loadedApps.forEach(element => {
            if (element[1].name == "appUptime") {
                screenTimeAppUptime = element[1].appUpTime; // Set screen time app uptime

                dailyAppData.push({
                    name: "appUptime",
                    appUpTime: element[1].appUpTime
                }); // Push the app uptime data to daily app data

            } else {
                let name = element[1].name; // Get app name
                let time = element[1].upTime; // Get app uptime
                let iconPath = element[1].icon; // Get app icon path
                let path = element[1].path; // Get app path
                newApp(name, iconPath, time); // Create a new app element

                dailyAppData.push({
                    name: name,
                    path: path,
                    upTime: time,
                    icon: iconPath
                });

                processTime[name] = element[1].upTime; // Set process time for the app
            }
        });
    }

    // Hide loading text and display apps container after 2 seconds
    setTimeout(() => {
        document.getElementById('appsContainer').style.display = ''; // Show the apps container
        document.getElementById('loadingText').style.display = 'none'; // Hide the loading text
    }, 2000);

    sortApps(); // Sort the apps

    while (true) { // Infinite loop to continuously update the app data
        try {

            const date = new Date(); // Get the current date and time
            if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0) { // Check if it's midnight
                await window.electronAPI.saveData(dailyAppData, screenTimeAppUptime); // Save the data using Electron API
                appData = {}; // Clear the app data
                dailyAppData = []; // Clear the daily app data
                processTime = {}; // Clear the process time object
                formattedProcessTime = {}; // Clear the formatted process time object
                screenTimeAppUptime = 1000; // Reset the screen time app uptime
                document.querySelectorAll('#appsContainer .app').forEach(app => {
                    if (app.id != 'totalRuntime') {
                        app.remove(); // Remove all app elements except the total runtime element
                    } else {
                        app.querySelector('.appTime').textContent = '1s'; // Reset the total runtime to 0s
                    }
                })
            }
            
            // Save the daily app data every 120 seconds
            if (screenTimeAppUptime % 120000 == 0) {            
                await window.electronAPI.saveData(dailyAppData, screenTimeAppUptime); // Save the data using Electron API
            }

            const app = await window.electronAPI.getApps(); // Get the active apps using Electron API
            const activeWindow = app.activeWindow; // Get the active window details

            // Skip if the active window title is null or empty
            if (activeWindow.title == null || activeWindow.title == "") {
                console.log("Skipping"); // Log skipping message
                await delay(1000); // Wait for 1 second before continuing
                continue; // Continue to the next iteration of the loop
            }

            let appTitle = activeWindow.owner.name; // Get the application title
            appTitle = appTitle.replace('.exe', ''); // Remove the '.exe' extension from the title

            // timestamp[appTitle] = new Date().getTime(); // Update the timestamp for the application
            await delay(1000); // Wait for 1 second

            // If the app is not already being tracked, create a new app element
            if (!processTime[appTitle]) {
                processTime[appTitle] = 0; // Initialize process time for the app
                await newApp(appTitle, app.iconPath); // Create a new app element
            }

            // Update the icon if a new image is available
            if (app.isNewImage) {
                const iconElement = document.getElementById(`${appTitle}-icon`); // Get the icon element by id
                iconElement.src = null; // Clear the current icon source
                iconElement.src = app.iconPath; // Set the new icon source
            }

            // Update the process time for the app

            const totalTimeCounter = document.getElementById('totalTime-time'); // Get the total time counter element
            totalTimeCounter.innerText = formatTime(screenTimeAppUptime); // Update the total time counter with formatted time
            screenTimeAppUptime+=1000; // Increment the screen time app uptime

            processTime[appTitle] += 1000; // Update the process time for the app
            
            formattedProcessTime[appTitle] = formatTime(processTime[appTitle]); // Format the process time
            updateApp(appTitle, formattedProcessTime[appTitle]); // Update the app time

            appData[appTitle] = activeWindow; // Update the app data
            appData[appTitle]["upTime"] = processTime[appTitle]; // Update the uptime for the app

            if (dailyAppData.find((obj) => obj.name === "appUptime")) {
                dailyAppData.find((obj) => obj.name === "appUptime").appUpTime = screenTimeAppUptime; // Update the app uptime
            } else {
                dailyAppData.push({
                    name: "appUptime",
                    appUpTime: screenTimeAppUptime
                }); // Push the app uptime data to daily app data
            }

            // Update or add the app data to the daily app data
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

            const timeElement = document.getElementById(`${appTitle}-time`); // Get the time element by id
            timeElement.dataset.time = processTime[appTitle]; // Update the data-time attribute

            sortApps(); // Sort the apps
        } catch (error) {
            console.error(error); // Log any errors
        }
    }
}

// Function to sort the apps based on their time
function sortApps() {
    const appsContainer = document.getElementById('appsContainer'); // Get the apps container element
    const apps = Array.from(appsContainer.children); // Get all app elements as an array
    apps.sort((a, b) => {
        const timeA = Number(a.querySelector('.appTime').dataset.time); // Get the time of app a
        const timeB = Number(b.querySelector('.appTime').dataset.time); // Get the time of app b
        return timeB - timeA; // Sort in descending order of time
    });

    appsContainer.innerHTML = ''; // Clear the apps container
    apps.forEach(app => appsContainer.appendChild(app)); // Append sorted apps to the container
}

// Listen for requests from the main process
window.electronAPI.receiveRequestFromMain((event) => {
    console.log("Requested"); // Log the request
    window.electronAPI.sendVariableToMain(dailyAppData); // Send the daily app data to the main process
});
