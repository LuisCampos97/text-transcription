document
  .getElementById("select-audio-file")
  .addEventListener("click", async () => {
    console.log("click");
    const filePath = await window.electron.selectAudioFile();
    document.getElementById("audio-file-path").innerText =
      filePath || "No file selected";
  });

document
  .getElementById("select-output-path")
  .addEventListener("click", async () => {
    const filePath = await window.electron.selectOutputPath();
    document.getElementById("output-file-path").innerText =
      filePath || "No file selected";
  });

document.getElementById("transcribe").addEventListener("click", async () => {
  const inputFilePath = document.getElementById("audio-file-path").innerText;
  const outputFilePath = document.getElementById("output-file-path").innerText;

  if (!inputFilePath || !outputFilePath) {
    document.getElementById("status").innerText =
      "Please select both input and output files.";
    return;
  }

  document.getElementById("status").innerText = "Transcribing...";

  const result = await window.electron.transcribeAudio(
    inputFilePath,
    outputFilePath
  );

  if (result.success) {
    document.getElementById("status").innerText =
      "Transcription completed successfully!";
  } else {
    document.getElementById("status").innerText = `Error: ${result.error}`;
  }
});
