const { OpenAI } = require('openai');
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default function handler(req, res) {
    const openai = new OpenAI({
        apiKey: process.env.GATSBY_OPENAI_API_KEY,
    });

    //const imagePath = req.body.image.imageUrl;
    console.log(req.body)
    const imagePath = req.body.image.imageUrl;
    const spreadsheet = req.body.spreadsheet;
    const tab = req.body.tab;
    const descriptionColumn = req.body.descriptionColumn;
    
    async function describeImage(imagePath, callback) {
    const CG_annotation_prompt = `Describe this artwork with no more than three or two sentences. Include any relevant information that you think would be helpful for someone who is blind or visually impaired. Avoid making assumptions about gender. If you are inclined to describe the gender presentation of a figure, use descriptive terms like fem, femme and masc. DO NOT start sentences with 'The artwork is...' or 'This is a picture of...' or 'Presented is...'. Instead, describe the content of the image, starting with the most important details.`;
    console.log('Describing image at: ', imagePath);
    try {
        const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
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

function injectDescription(description) {

}

describeImage(imagePath, (description: any) => {
    console.log(description);
    injectDescription(description);
    res.status(200).json({ message: description});
    
});

    
}