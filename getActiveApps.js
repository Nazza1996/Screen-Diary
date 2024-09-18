const activeWin = require('active-win');
const icon = require('file-icon-extractor');
const path = require('path');

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

module.exports = { getApps };