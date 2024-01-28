import sharp from "sharp";
import path from 'path';
import {OUTPUT_DIR, WATERMARK_PATH} from "../constants";
import * as fs from "fs";

export class ImageProcessor {

    async addWatermark(imagePath: string) {
        const watermarkPath = path.resolve(process.cwd(), WATERMARK_PATH);
        const outputPath = path.resolve(process.cwd(), OUTPUT_DIR, path.basename(imagePath));
        const image = await sharp(imagePath).rotate();
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Image has invalid dimensions');
        }
        const watermarkHeight = Math.round(metadata.height / 8);
        const watermark = await sharp(watermarkPath)
            .resize({height: watermarkHeight}) // Resize watermark to match the width of the main image
            .toBuffer();

        await image
            .composite([{input: watermark, gravity: 'southwest'}]) // Position at bottom-left
            .toFile(outputPath);

        return outputPath;
    }

    async addToFolder(filePath: string) {
        // Create the output folders
        const facebookDir = path.join(OUTPUT_DIR, 'facebook');
        const meetupDir = path.join(OUTPUT_DIR, 'meetup');
        const instagramDir = path.join(OUTPUT_DIR, 'instagram');
        if (!fs.existsSync(facebookDir)) fs.mkdirSync(facebookDir);
        if (!fs.existsSync(meetupDir)) fs.mkdirSync(meetupDir);
        if (!fs.existsSync(instagramDir)) fs.mkdirSync(instagramDir);

        // If the file is an image, process it accordingly
        const image = sharp(filePath);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Image has invalid dimensions');
        }
        // If the image is horizontal, copy it to the 'facebook' folder
        if (metadata.width > metadata.height) {
            fs.copyFileSync(filePath, path.join(facebookDir, path.basename(filePath)));
            process.env.VERBOSE && console.log(`Image copied to facebook folder: ${filePath}`);

            // Reduce the size of the image by 50% and copy it to the 'meetup' folder
            const resizedImagePath = path.join(meetupDir, path.basename(filePath));
            process.env.VERBOSE && console.log(`Resizing image: ${filePath}`);
            await image.resize(Math.round(metadata.width * 0.5)).toFile(resizedImagePath);
            process.env.VERBOSE && console.log(`Image resized: ${filePath}`);
        }

        // Copy all files to the 'instagram' folder
        fs.copyFileSync(filePath, path.join(instagramDir, path.basename(filePath)));
        process.env.VERBOSE && console.log(`Image copied to instagram folder: ${filePath}`);
    }

    async process(filePath: string) {
        process.env.VERBOSE && console.log(`Processing image: ${filePath}`);

        const outputPath = await this.addWatermark(filePath);
        process.env.VERBOSE && console.log(`Watermark added to image: ${filePath}`);
        await this.addToFolder(outputPath);
        process.env.VERBOSE && console.log(`Image copied to folders: ${filePath}`);
    }
}
