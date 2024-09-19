const activeWin = require('active-win');
const icon = require('file-icon-extractor');
const path = require('path');
const fs = require('fs');

const delay = millis => new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), millis)
  });

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

function saveData(processData) {
    const date = new Date();
    const stringDate = `${date.getDate()}${date.getMonth()+1}${date.getFullYear()}`;

    const savedData = [];

    Object.entries(processData).forEach(element => {
        savedData.push({
            name: element[1].owner.name,
            path: element[1].owner.path,
            upTime: element[1].upTime,
            icon: `./icons/${path.parse(path.basename(element[1].owner.path)).name}.png`
        })
    })


    fs.writeFile(`./data/${stringDate}.json`, JSON.stringify(savedData), (err) => {
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