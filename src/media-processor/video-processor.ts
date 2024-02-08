import ffmpeg from 'fluent-ffmpeg';
import fs from "fs";
import path from "path";
import {OUTPUT_DIR, WATERMARK_PATH} from "../constants";

export class VideoProcessor {

    async addWatermark(videoPath: string) {
        const watermarkPath = path.resolve(process.cwd(), WATERMARK_PATH);
        const outputPath = path.resolve(process.cwd(), OUTPUT_DIR, path.basename(videoPath));

        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .outputOptions([
                    `-vf "movie=${watermarkPath} [watermark]; [in][watermark] overlay=W-w-10:H-h-10 [out]"`
                ])
                .on('error', reject)
                .on('end', () => resolve(outputPath))
                .save(outputPath);
        });
    }
    async addToFile(filePath: string) {
        const instagramDir = path.join(OUTPUT_DIR, 'instagram');

        // if there is not an instagram folder, create it
        if (!fs.existsSync(instagramDir)) fs.mkdirSync(instagramDir);
        fs.copyFileSync(filePath, path.join(instagramDir, path.basename(filePath)));
        process.env.VERBOSE && console.log(`Image copied to instagram folder: ${filePath}`);
    }
    async process(filePath: string) {
        //const outputPath = await this.addWatermark(filePath);
        process.env.VERBOSE && console.log(`Watermark added to video: ${filePath}`);
        await this.addToFile(filePath);
    }
}
