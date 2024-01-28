import {ImageProcessor} from "./image-processor";
import {VideoProcessor} from "./video-processor";

export class MediaProcessor {
    async getProcess(filePath: string) {
        const filePathLowerCase = filePath.toLowerCase();
        if(filePathLowerCase.endsWith('.jpg') || filePath.endsWith('.jpeg')){
            return new ImageProcessor();
        }
        if(filePathLowerCase.endsWith('.mp4')){
            return new VideoProcessor();
        }
        throw new Error('Unsupported media type');
    }
}
