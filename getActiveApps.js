const activeWin = require('active-win'); // Module to get the active window
const icon = require('file-icon-extractor'); // Module to extract file icons
const path = require('path'); // Node.js path module
const fs = require('fs'); // Node.js file system module
const { app } = require('electron');

// Function to get the active application details
function getApps() {
    try {
        const activeWindow = activeWin.sync(); // Get the active window synchronously

        if (!fs.existsSync(path.join(app.getPath('userData'), '/Icons'))) {
            fs.mkdirSync(path.join(app.getPath('userData'), '/Icons')); // Create the icons directory if it doesn't exist
        }

        const iconPath = path.join(app.getPath('userData'), `/Icons/${path.parse(path.basename(activeWindow.owner.path)).name}.png`); // Construct the icon path
        let isNewImage = false;

        try {
            // Check if the icon already exists
            if (!fs.existsSync(iconPath)) {
                icon.extract(activeWindow.owner.path, path.join(app.getPath('userData'), '/Icons'), 'png'); // Extract the icon if it doesn't exist
                isNewImage = true; // Mark the image as new
            }

            // Return the active window details, icon path, and new image status
            return {activeWindow: activeWindow, iconPath: iconPath, isNewImage: isNewImage};
        } catch (error) {
            console.error(error); // Log any errors during icon extraction
        }
    } catch (error) {
        console.error(error); // Log any errors during active window retrieval
    }
}

// Function to save data to a file
function saveData(data, appUptime) {
    const date = new Date(); // Get the current date
    const stringDate = `${date.getDate()}${date.getMonth()+1}${date.getFullYear()}`; // Format the date as a string

    if (!fs.existsSync(path.join(app.getPath('userData'), '/Save Data'))) {
        fs.mkdirSync(path.join(app.getPath('userData'), '/Save Data')); // Create the save data directory if it doesn't exist
    }

    const savePath = path.join(app.getPath('userData'), `/Save Data/${stringDate}.json`); // Construct the save path

    try {
        // Write the data to the file
        fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error); // Log any errors during file writing
    }
}

// Function to load data from a file
function loadData() {
    const date = new Date(); // Get the current date

    try {
        // Construct the load path
        const loadPath = path.join(app.getPath('userData'), `/Save Data/${date.getDate()}${date.getMonth()+1}${date.getFullYear()}.json`);
        const data = JSON.parse(fs.readFileSync(loadPath)); // Read and parse the data from the file

        return data; // Return the loaded data
    } catch {
        return null; // Return null if there was an error (e.g., file not found)
    }
}

// Function to check if an image exists at the given path
function ifImageExists (path) {
    return fs.existsSync(path); // Return true if the file exists, false otherwise
}

// Export the functions for use in other modules
module.exports = { getApps, saveData, loadData, ifImageExists };