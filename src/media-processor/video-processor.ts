import fs from "fs";
import path from "path";
import {OUTPUT_DIR} from "../constants";

export class VideoProcessor {

    async addToFile(filePath: string) {
        const instagramDir = path.join(OUTPUT_DIR, 'instagram');

        // add to Instagram folder
        fs.copyFileSync(filePath, path.join(instagramDir, path.basename(filePath)));
        process.env.VERBOSE && console.log(`Image copied to instagram folder: ${filePath}`);
    }
    async process(filePath: string) {
        await this.addToFile(filePath);
    }
}
