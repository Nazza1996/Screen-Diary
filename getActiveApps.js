const activeWin = require('active-win');
const icon = require('file-icon-extractor');
const path = require('path');
const fs = require('fs');

function getApps() {
    try {
        const activeWindow = activeWin.sync();
        icon.extract(activeWindow.owner.path, './icons', 'png');
        try {
            const i = `./icons/${path.parse(path.basename(activeWindow.owner.path)).name}.png`;

            return {activeWindow: activeWindow, iconPath: i};
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

    fs.writeFile(`./data/${stringDate}.json`, JSON.stringify(data), (err) => {
        if (err) {
            console.error(err);
        }
    });
}

function loadData() {
    try {
        const date = new Date();
        const path = `./data/${date.getDate()}${date.getMonth()+1}${date.getFullYear()}.json`;
        const data = JSON.parse(fs.readFileSync(path));

        return data;
    } catch {
        return null;
    }
}

function ifImageExists (path) {
    return fs.existsSync(path);
}

module.exports = { getApps, saveData, loadData, ifImageExists };