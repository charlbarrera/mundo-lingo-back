import * as fs from "fs";
import {INPUT_DIR, OUTPUT_DIR} from "../constants";
import {rimraf} from "rimraf";

const formatsSupported = ['png', 'jpg', 'mp4'];

export function cleanFiles() {
    fs.readdirSync(INPUT_DIR).forEach(file => {
        const fileExtension = file.split('.')[1].toLowerCase();

        if (!formatsSupported.includes(fileExtension)) {
            fs.unlinkSync(`${INPUT_DIR}/${file}`);
        }
    });

    // Delete all files in the output directory
    rimraf.sync(`${OUTPUT_DIR}/*`);
}
