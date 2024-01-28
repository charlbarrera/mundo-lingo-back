import AdmZip from 'adm-zip';
import * as fs from "fs";
import path from "path";
import {INPUT_DIR, OUTPUT_DIR} from "../constants";
import {getDateEvent} from "./date.utils";
import sharp from "sharp";

export enum ZipFormat {
    'Vertical' = 'vertical',
    'Horizontal' = 'horizontal',
}

export class ZipUtils {
    static async zipFiles(): Promise<void> {
        const watermarkedHorizontalZip = new AdmZip();
        const watermarkedVerticalZip = new AdmZip();
        const originalZip = new AdmZip();
        const watermarkedFiles = fs.readdirSync(path.resolve(process.cwd(), OUTPUT_DIR));
        const originalFiles = fs.readdirSync(path.resolve(process.cwd(), INPUT_DIR));
        const eventDate = getDateEvent();
        console.log('eventDate', eventDate);

        for (const file of watermarkedFiles) {
            const filePath = path.resolve(process.cwd(), OUTPUT_DIR, file);
            // if it is a folder, a zip file or a .DS_Store, skip it
            if (fs.lstatSync(filePath).isDirectory() || path.extname(filePath) === '.zip' ||  file === '.DS_Store') {
                continue;
            }
            process.env.VERBOSE && console.log('filePath', filePath);
            const metadata = await sharp(filePath).metadata();

            if (!metadata.width || !metadata.height) {
                throw new Error('Image has invalid dimensions');
            }
            if (metadata.width > metadata.height) {
                watermarkedHorizontalZip.addLocalFile(path.resolve(process.cwd(), OUTPUT_DIR, file));
            } else {
                watermarkedVerticalZip.addLocalFile(path.resolve(process.cwd(), OUTPUT_DIR, file));
            }
        }
        console.log('all watermarked files added to zip');

        originalFiles.forEach(file => {
            originalZip.addLocalFile(path.resolve(process.cwd(), INPUT_DIR, file));
        });
        console.log('all original files added to zip');

        const watermarkedVerticalZipName = `${eventDate}-watermarked-vertical.zip`;
        const watermarkedHorizontalZipName = `${eventDate}-watermarked-horizontal.zip`;
        const originalZipName = `${eventDate}-original.zip`;

        watermarkedVerticalZip.writeZip(`${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-watermarked-vertical.zip`);
        console.log('watermarked vertical zip created: ', watermarkedVerticalZipName);
        watermarkedHorizontalZip.writeZip(`${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-watermarked-horizontal.zip`);
        console.log('watermarked horizontal zip created: ', watermarkedHorizontalZipName);
        originalZip.writeZip(`${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-original.zip`);
        console.log('original zip created: ', originalZipName);
    }
}
