const activeWin = require('active-win');

function getApps() {
    const activeWindow = activeWin.sync();
    const appTitle = activeWindow.owner.name;
    return appTitle;
}

module.exports = { getApps };