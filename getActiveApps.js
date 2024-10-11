const activeWin = require('active-win'); // Module to get the active window
const icon = require('file-icon-extractor'); // Module to extract file icons
const path = require('path'); // Node.js path module
const fs = require('fs'); // Node.js file system module

// Function to get the active application details
function getApps() {
    try {
        const activeWindow = activeWin.sync(); // Get the active window synchronously
        const iconPath = path.join(__dirname, `/icons/${path.parse(path.basename(activeWindow.owner.path)).name}.png`); // Construct the icon path
        let isNewImage = false;
        
        try {
            // Check if the icon already exists
            if (!fs.existsSync(iconPath)) {
                icon.extract(activeWindow.owner.path, path.join(__dirname, '/icons'), 'png'); // Extract the icon if it doesn't exist
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

    const savePath = path.join(__dirname, `/data/${stringDate}.json`); // Construct the save path

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
        const loadPath = path.join(__dirname, `/data/${date.getDate()}${date.getMonth()+1}${date.getFullYear()}.json`);
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