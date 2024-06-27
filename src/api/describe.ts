import { OpenAI } from 'openai';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ];

const jwtFromEnv = new JWT({
    email: process.env['GATSBY_SERVICE_ACCOUNT_CLIENT_EMAIL'],
    key: process.env['GATSBY_SERVICE_ACCOUNT_PRIVATE_KEY']?.replace(/\\n/g, '\n'), 
    scopes: SCOPES,
});

//const prompt = `Describe this artwork with no more than four or five sentences. Include any relevant information that you think would be helpful for someone who is blind or visually impaired. Avoid making assumptions about gender. If you are inclined to describe the gender presentation of a figure, use descriptive terms like fem, femme and masc. DO NOT start sentences with 'The artwork is...' or 'This is a picture of...' or 'Presented is...'. Instead, describe the content of the image, starting with the most important details.`;
const prompt = `Describe this artwork with no more than four or five sentences. Include any relevant information that you think would be helpful for someone who is blind or visually impaired. Avoid making assumptions about gender. If you are inclined to describe the gender presentation of a figure, use descriptive terms like fem, femme and masc. DO NOT start sentences with 'The artwork is...' or 'This is a picture of...' or 'Presented is...'. Instead, describe the artist's choices in terms of the content of the image, starting with the most important details. Emphasize the artist's choices, such as medium and style and color, using phrases like 'The artist...' and 'Here we can see...'"`;

export default function handler(req, res) {
    const openai = new OpenAI({
        apiKey: process.env.GATSBY_OPENAI_API_KEY,
    });
    const imagePath = req.body.image.imageUrl;
    const spreadsheet = req.body.spreadsheet;
    const sheetName = req.body.sheet;
    const descriptionCol = req.body.descriptionCol;
    const descriptionRow = req.body.image.row;
    
    async function describeImage(imagePath, callback) {
        const CG_annotation_prompt = prompt;
        console.log('Describing image at: ', imagePath);
        try {
            const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                role: "user",
                content: [
                    { type: "text", text: CG_annotation_prompt },
                    {
                    type: "image_url",
                    image_url: {
                        "url": imagePath,
                    },
                    },
                ],
                },
            ],
            "max_tokens": 500
            });
            callback(response.choices[0].message.content)
        } catch (error) {
            console.error(error);
        } 
    }

    async function injectDescription(description) {
        const doc = new GoogleSpreadsheet(spreadsheet, jwtFromEnv);    
        try {
            await doc.loadInfo();
            const sheet = (sheetName && sheetName.length) > 0 ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0];
            await sheet.loadCells({ // GridRange object
                startRowIndex: Math.max(0,descriptionRow - 1), 
                endRowIndex: descriptionRow + 1, 
                startColumnIndex: Math.max(descriptionCol -1), 
                endColumnIndex: descriptionCol + 1
                });
            const cell = sheet.getCell(descriptionRow, descriptionCol);
            cell.value = description;
            await sheet.saveCells([cell]);
            res.status(200).json({message: description});
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: JSON.stringify(err) });
        }
            
    }

    describeImage(imagePath, (description: any) => {
        console.log(description);
        injectDescription(description);
    });
}
