import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { transcribeTextFromAudio } from './transcriber';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('select-audio-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openFile'],
        filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }],
    });
    return result.filePaths[0];
});

ipcMain.handle('select-output-path', async () => {
    const result = await dialog.showSaveDialog(mainWindow!, {
        filters: [{ name: 'Docx Files', extensions: ['docx'] }],
    });
    return result.filePath;
});

ipcMain.handle('transcribe-audio', async (event, inputFile, outputFile) => {
    try {
        await transcribeTextFromAudio(inputFile, outputFile);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
});

