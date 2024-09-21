const path = require('path');
const os = require('os');
const ws = require('windows-shortcuts')
const fs = require('fs');

async function toggleRunOnStartup() {
    const startUpFolder = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const exePath = 'Screen Diary.exe';
    const targetPath = path.join(startUpFolder, 'ScreenDiary.lnk');

    if (!fs.existsSync(targetPath)) {
        ws.create(targetPath, exePath, (err) => {
            if (err) {
                console.error('Failed to create shortcut: ', err);
            }
        });
    } else {
        fs.rmSync(targetPath);
    }
}





module.exports = { toggleRunOnStartup };