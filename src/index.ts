import {INPUT_DIR} from "./constants";
import express from 'express';
import * as fs from 'fs';
import {MediaProcessor} from "./media-processor";
import {ZipUtils} from "./utils/zip.utils";
import {cleanFiles} from "./utils/files";
import {getLastTuesday} from "./utils/date.utils";
import bodyParser from "body-parser";
import Tesseract from "tesseract.js";
const path = require('path');
require('dotenv').config();

async function processMediaInDirectory() {
    try {
        const directory = INPUT_DIR;
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const inputFullPath = path.join(directory, file);
            const mediaProcessor = new MediaProcessor();
            const processor = await mediaProcessor.getProcess(inputFullPath);
            await processor.process(inputFullPath);
        }
        console.log('All media processed');

    } catch (error) {
        console.error('Error processing directory:', error);
    }
}

type Args = { date: string };
export function parseArguments(): Args {
    const  args: Args = {
        date: getLastTuesday()
    };
    process.argv.slice(2).forEach(arg => {
        console.log('arg', arg);
        const [key, value] = arg.split('=');
        if (key === 'date') {
            args.date = value;
        }
    });

    return args;
}

async function readTextFromImage(imagePath: string) {
    try {
        console.log('imagePath', imagePath);
        const result = await Tesseract.recognize(imagePath, 'eng', { logger: m => console.log(m) });
        const text = result.data.text;
        const totalRegex = /TOTAL\s*\$([\d\.]+)/;
        const match = text.match(totalRegex);

        if (match) {
            const total = parseFloat(match[1]);
            console.log(`Total: $${total}`);
        } else {
            console.log('Total not found');
        }
    } catch (error) {
        console.error('Error reading text from image:', error);
    }
}


const app = express();

app.use(bodyParser.json());

app.post('/api/process-media', async (req, res) => {
    try {
        console.time('Total time');
        console.time('Cleaning files');
        cleanFiles();
        console.timeEnd('Cleaning files');
        console.time('Processing media');
        await processMediaInDirectory( );
        console.timeEnd('Processing media');
        await ZipUtils.zipFiles();
        console.timeEnd('Total time');
        res.status(200).send('All media processed');
    } catch (error) {
        res.status(500).send('Error processing media');
    }
});

app.post('/api/read-text-from-image', async (req, res) => {
    try {
        const { imagePath } = req.body;
        console.log('req.body', req);
        await readTextFromImage(imagePath);
        res.status(200).send('All media processed');
    } catch (error) {
        console.error('Error processing media:', error);
        res.status(500).send('Error processing media');
    }
});

app.listen(8080, () => {
    console.log('server started at: ' + 8080);
});
