const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    selectAudioFile: () => ipcRenderer.invoke("select-audio-file"),
    selectOutputPath: () => ipcRenderer.invoke("select-output-path"),
    transcribeAudio: (inputFile: string, outputFile: string) =>
        ipcRenderer.invoke("transcribe-audio", inputFile, outputFile),
});
