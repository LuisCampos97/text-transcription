import { AssemblyAI } from "assemblyai";
import type { TranscribeParams, Transcript } from "assemblyai";
import 'dotenv/config';
import * as fs from 'fs';
import type { Transcription } from './models/transcription';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import * as path from 'path';

/**
 * Transcribe text from audio file
 *
 * @param inputAudioFile - Audio file to transcribe text (.mp3, .wav, etc...)
 * @param outputDocxPath - Path for the genereated docx file (Ex.:  "C:\Users\user\Desktop\generated-doc.docx")
 */
async function transcribeTextFromAudio(inputAudioFile: string, outputDocxPath: string, witnessName?: string): Promise<void> {
    if (!process.env.ASSEMBLY_API_KEY) {
        console.error("Please set the ASSEMBLY_API_KEY environment variable");
        return;
    }

    const client = new AssemblyAI({
        apiKey: process.env.ASSEMBLY_API_KEY,
    });

    const data: TranscribeParams = {
        audio: inputAudioFile,
        speaker_labels: true,
        language_code: "pt",
        speakers_expected: 4,
    };

    try {
        const transcript: Transcript = await client.transcripts.transcribe(data);
        if (!transcript.utterances) {
            console.log("It was not possible to transcribe any text.");
            return;
        }

        const transcriptions: Transcription[] = transcript.utterances.map(utterance => {
            return {
                "timestamp": convertMillisecondsToTime(utterance.start),
                "speaker": utterance.speaker,
                "text": utterance.text
            }
        });

        generateDocxFile(transcriptions, path.parse(inputAudioFile).name, outputDocxPath);
    } catch (err: any) {
        console.error(`Something went wrong in the process of transcribing the text. Reason: ${err.message}`);
    }
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

/**
 * Genreate a .docx file from the transcriptions
 *
 * @param transcriptions - List of all transcriptions
 * @param inputAudioName - Name of the audio file (without file extension)
 * @param outputDocxPath - Path for the genereated docx file (Ex.:  "C:\Users\user\Desktop\generated-doc.docx")
 */
function generateDocxFile(transcriptions: Transcription[], inputAudioName: string, outputDocxPath: string, witnessName?: string) {
    const templateContent = fs.readFileSync('./template.docx', 'binary');

    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
        linebreaks: false,
    });

    doc.render({
        fileName: inputAudioName,
        witnessName: witnessName ?? "",
        transcriptions,
    });

    const buff = doc.getZip().generate({
        type: 'nodebuffer',
        compression: "DEFLATE"
    });

    fs.writeFileSync(outputDocxPath, buff);
}

const audioFileToTranscribe = process.argv[2];
const outputDocxPath = process.argv[3];
if (!audioFileToTranscribe) {
    console.error("Please provide the audio file path as a parameter 1.");
    process.exit(1);
}

if (!outputDocxPath) {
    console.error("Please provide the docx path to save as a parameter 2.");
    process.exit(1);
}

transcribeTextFromAudio(audioFileToTranscribe, outputDocxPath);
