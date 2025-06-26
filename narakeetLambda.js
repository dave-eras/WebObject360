import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import https from 'https';

// Configure AWS SDK
const s3Client = new S3Client({
    region: 'eu-central-1'
});

const languageVoiceMap = {
    'EN': 'Bronagh',
    'ES': 'Pilar',
    'FR': 'Brigitte',
    'DE': 'Helmut',
    'IT': 'Ornella',
    'BG': 'Kiril',
    'CS': 'Barbora',
    'DA': 'Inger',
    'EL': 'Eleni',
    'ET': 'Pille',
    'FI': 'Eevi',
    'GA': 'Aoife',
    'HU': 'Vilmos',
    'HR': 'Jasna',
    'IS': 'Steinunn',
    'LV': 'Kristaps',
    'LT': 'Vaida',
    'MK': 'Vlatko',
    'MT': 'Corazon',
    'NO': 'Aslak',
    'NL': 'Fransje',
    'PL': 'Andrzej',
    'PT': 'Ines',
    'RO': 'Alina',
    'SK': 'Zuzana',
    'SL': 'Janez',
    'SV': 'Malin',
    'SR': 'Lazar',
    'TR': 'Leyla',
};

const APIKEY = 'XXX';

const handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event));
    
    // Get the origin from the request headers
    const origin = event.headers?.origin || event.headers?.Origin;
    
    // Define allowed origins
    const allowedOrigins = [
        'local',
        'platform',
        'amazon demonstration space'
    ];
    
    // Check if the origin is allowed
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    
    const text = event.queryStringParameters.text;
    const targetLanguage = event.queryStringParameters.targetLanguage.toUpperCase();
    
    console.log(`Processing request for text: "${text}", language: ${targetLanguage}`);
    
    const voice = languageVoiceMap[targetLanguage];

    if (!voice) {
        console.error(`No voice found for language: ${targetLanguage}`);
        return {
            statusCode: 400,
            headers: { 
                'Content-Type': 'application/json', 
                "Access-Control-Allow-Origin": corsOrigin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Accept, x-api-key",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify({ error: 'Unsupported language', language: targetLanguage })
        };
    }

    // First try to get from S3
    const commandGet = new GetObjectCommand({
        Bucket: '360realworld',
        Key: `audio/${targetLanguage}/${text}.m4a`,
    });

    try {
        console.log('Attempting to get file from S3...');
        const response = await s3Client.send(commandGet);
        console.log('File found in S3, returning...');
        const data = await response.Body.transformToByteArray();
        const buffer = Buffer.from(data).toString("base64");

        return {
            statusCode: 200,
            headers: { 
                "content-type": "audio/x-m4a", 
                "Access-Control-Allow-Origin": corsOrigin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Accept, x-api-key",
                "Access-Control-Allow-Credentials": "true"
            },
            body: buffer,
            isBase64Encoded: true
        };
    } catch (err) {
        if (err.name === 'NoSuchKey') {
            console.log('File not found in S3, generating new audio...');
        } else {
            console.error('Error in S3 get operation:', err);
            return {
                statusCode: 500,
                headers: { 
                    'Content-Type': 'application/json', 
                    "Access-Control-Allow-Origin": corsOrigin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Accept, x-api-key",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({ error: 'S3 error', details: err.message })
            };
        }
    }

    // If we get here, we need to generate new audio
    const options = {
        hostname: 'api.narakeet.com',
        path: `/text-to-speech/m4a?voice=${voice}`,
        method: 'POST',
        headers: {
            'accept': 'application/octet-stream',
            'x-api-key': APIKEY,
            'content-type': 'text/plain',
        },
    };

    const httpRequest = (options, text) => {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('statusCode=' + res.statusCode));
                }
                const data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            });
            req.on('error', (err) => {
                console.error('Error in Narakeet API request:', err);
                reject(err);
            });
            req.write(text);
            req.end();
        });
    };

    try {
        console.log('Requesting audio from Narakeet...');
        const audioStream = await httpRequest(options, text);
        console.log('Successfully got audio from Narakeet');

        const uploadParams = {
            Bucket: '360realworld',
            Key: `audio/${targetLanguage}/${text}.m4a`,
            Body: audioStream,
            ContentType: 'audio/m4a'
        };

        console.log('Uploading to S3...');
        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log('Successfully uploaded to S3');

        // Return the audio stream directly instead of trying to get it from S3 again
        return {
            statusCode: 200,
            headers: { 
                "content-type": "audio/x-m4a", 
                "Access-Control-Allow-Origin": corsOrigin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Accept, x-api-key",
                "Access-Control-Allow-Credentials": "true"
            },
            body: audioStream.toString('base64'),
            isBase64Encoded: true
        };
    } catch (err) {
        console.error('Error in audio generation/upload process:', err);
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json', 
                "Access-Control-Allow-Origin": corsOrigin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Accept, x-api-key",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify({ error: 'Audio generation failed', details: err.message })
        };
    }
};

export { handler };
