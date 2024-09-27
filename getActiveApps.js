const activeWin = require('active-win');
const icon = require('file-icon-extractor');
const path = require('path');
const fs = require('fs');

function getApps() {
    try {
        const activeWindow = activeWin.sync();
        const iconPath = path.join(__dirname, `/icons/${path.parse(path.basename(activeWindow.owner.path)).name}.png`);
        let isNewImage = false;
        
        try {

            if (!fs.existsSync(iconPath)) {
                icon.extract(activeWindow.owner.path, path.join(__dirname, '/icons'), 'png');
                isNewImage = true;
            }

            return {activeWindow: activeWindow, iconPath: iconPath, isNewImage: isNewImage};
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error(error);
    }
}

function saveData(data) {
    const date = new Date();
    const stringDate = `${date.getDate()}${date.getMonth()+1}${date.getFullYear()}`;

    const savePath = path.join(__dirname, `/data/${stringDate}.json`)

    fs.writeFile(savePath, JSON.stringify(data), (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function loadData() {
    try {
        const date = new Date();
        const loadPath = path.join(__dirname, `/data/${date.getDate()}${date.getMonth()+1}${date.getFullYear()}.json`);
        const data = JSON.parse(fs.readFileSync(loadPath));

        return data;
    } catch {
        return null;
    }
}

function ifImageExists (path) {
    return fs.existsSync(path);
}

module.exports = { getApps, saveData, loadData, ifImageExists };