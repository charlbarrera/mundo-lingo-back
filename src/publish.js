const TelegramBot = require('node-telegram-bot-api');
const FB = require('fb');
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

async function createFacebookAlbum(pageId, albumName, accessToken) {
    FB.setAccessToken(accessToken);

    try {
        const response = await FB.api(`${pageId}/albums`, 'post', {
            name: albumName,
            appsecret_proof: getAppSecretProof(process.env.FB_APP_SECRET, accessToken)
        });
        console.log('Album created on Facebook:', response);
        return response.id;
    } catch (error) {
        console.error('Error creating album on Facebook:', error);
    }
}

async function postPhotoToFacebookAlbum(filePath, albumId, accessToken) {
    const data = {
        source: fs.createReadStream(filePath),
        message: 'Photo description',
        appsecret_proof: getAppSecretProof(process.env.FB_APP_SECRET, accessToken)
    };

    FB.setAccessToken(accessToken);

    try {
        const response = await FB.api(`${albumId}/photos`, 'post', data);
        console.log('Photo posted to Facebook:', response);
    } catch (error) {
        console.error('Error posting photo to Facebook:', error);
    }
}

async function sendPhotosToFacebook(filesPath, pageId, albumId, accessToken) {
    try {
        const files = fs.readdirSync(filesPath).filter(file => path.extname(file).toLowerCase() === '.jpg');
        for (const file of files) {
            const filePath = path.join(filesPath, file);

            // Determine if the image is horizontal
            const metadata = await sharp(filePath).metadata();
            if (metadata.width > metadata.height) {
                // The image is horizontal, post it to the Facebook album
                await postPhotoToFacebookAlbum(filePath, albumId, accessToken);
            }
        }
        console.log('Photos uploaded to Facebook:');
    } catch (error) {
        console.error('Error uploading photos to Facebook:', error);
    }
}

async function sendFileToTelegram(filePath, botToken, chatId) {
    if (botToken === undefined || chatId === undefined) {
        console.log('Telegram bot token or chat ID not defined, skipping Telegram');
        return;
    }
    const bot = new TelegramBot(botToken);
    console.log('Sending file to Telegram');
    await bot.sendDocument(chatId, filePath);
    console.log('File sent to Telegram');
}

function getAppSecretProof(appSecret, accessToken) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(accessToken);
    return hmac.digest('hex');
}

exports.publish = async function publish(outputDirectory, eventDate) {
    const accessToken = process.env.FB_ACCESS_TOKEN;
    const pageId = process.env.FB_PAGE_ID;
    const albumName = `Mundo Lingo NYC ${eventDate}`;
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    console.log('envs', accessToken, pageId, albumName, botToken, chatId);
    FB.setAccessToken(accessToken);

    console.log('proff', getAppSecretProof(process.env.FB_APP_SECRET, accessToken));
    const pages = await FB.api(`${pageId}/albums`, 'post',  {name: 'test',appsecret_proof: getAppSecretProof(process.env.FB_APP_SECRET, accessToken), degrees_of_freedom_spec: '3'});
    console.log('pages', pages);

    return;

    try {
        const albumId = await createFacebookAlbum(pageId, albumName, accessToken);
        console.log('Album created on Facebook:', albumId);
        if (albumId === undefined) {
            console.log('Album not created, skipping Facebook');
            return;
        }
        await sendPhotosToFacebook(outputDirectory, pageId, albumId, accessToken);
        await sendFileToTelegram(outputDirectory, botToken, chatId);
    } catch (error) {
        console.error('Error sending file to Telegram:', error);
    }
}
