import { AssemblyAI, TranscribeParams, Transcript } from "assemblyai";
import 'dotenv/config';

/**
 * Transcribe text from audio file
 *
 * @param filePath - Audio file to transcribe text
 */
function transcribeTextFromAudio(filePath: string): void {
    const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLY_API_KEY,
    });

    const data: TranscribeParams = {
        audio: filePath,
        speaker_labels: true,
        language_code: "pt",
        speakers_expected: 4,
    };

    client.transcripts.transcribe(data)
        .then((transcript: Transcript) => {
            for (const utterance of transcript.utterances) {
                //TODO: Convert to .docx file
                console.log(`${convertMillisecondsToTime(utterance.start)} Speaker ${utterance.speaker}: ${utterance.text}`);
            }
        })
        .catch((err: Error) => {
            console.error(`Something went wrong in the process of transcribing the text. Reason: ${err.message}`);
        });

};

/**
 * Convert milliseconds to {hours}:{minutes}:{seconds} format
 *
 * @param milliseconds - milliseconds to convert in number
 * @returns The converted time in specific format
 * */
function convertMillisecondsToTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const filePath = process.argv[2];
if (!filePath) {
    console.error("Please provide the file path as a parameter.");
    process.exit(1);
}

transcribeTextFromAudio(filePath);
