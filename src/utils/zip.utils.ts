import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import {getDateEvent} from "./date.utils";
import {INPUT_DIR, OUTPUT_DIR} from "../constants";
import sharp from "sharp";

// ...

export class ZipUtils {
    static async zipFiles(): Promise<void> {
        try {
            const eventDate = getDateEvent();
            console.log('eventDate', eventDate);

            const allFiles = fs.readdirSync(path.resolve(process.cwd(), OUTPUT_DIR));
            const originalFiles = fs.readdirSync(path.resolve(process.cwd(), INPUT_DIR));

            const horizontalFiles: string[] = [];
            const verticalFiles: string[] = [];

            for (const file of allFiles) {
                const filePath = path.resolve(process.cwd(), OUTPUT_DIR, file);
                if (fs.lstatSync(filePath).isDirectory() || path.extname(filePath) === '.zip' || file === '.DS_Store') {
                    continue;
                }

                const image = sharp(filePath);
                const metadata = await image.metadata();

                if (!metadata || !metadata.width || !metadata.height) {
                    continue;
                }

                if (metadata.width > metadata.height) {
                    horizontalFiles.push(file);
                } else {
                    verticalFiles.push(file);
                }
            }

            const zipFiles = async (files: string[], zipPath: string) => {
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Sets the compression level.
                });

                const output = fs.createWriteStream(zipPath);

                archive.pipe(output);

                for (const file of files) {
                    const filePath = path.resolve(process.cwd(), OUTPUT_DIR, file);
                    process.env.VERBOSE && console.log('filePath', filePath);
                    archive.file(filePath, { name: file });
                }

                await archive.finalize();
            };

            await zipFiles(horizontalFiles, `${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-horizontal.zip`);
            console.log('horizontal zip created');

            await zipFiles(verticalFiles, `${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-vertical.zip`);
            console.log('vertical zip created');

            await zipFiles(originalFiles, `${path.resolve(process.cwd(), OUTPUT_DIR)}/${eventDate}-original.zip`);
            console.log('original zip created');
        } catch (error) {
            console.error('Error zipping files:', error);
            throw error;
        }
    }
}
