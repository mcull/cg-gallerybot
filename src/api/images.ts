import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default function handler(req, res) {

    const SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ];

    const jwtFromEnv = new JWT({
        email: process.env['GATSBY_SERVICE_ACCOUNT_CLIENT_EMAIL'],
        key: process.env['GATSBY_SERVICE_ACCOUNT_PRIVATE_KEY']?.replace(/\\n/g, '\n'), 
        scopes: SCOPES,
    });

    const spreadsheet = req.body.spreadsheet;
    if (!spreadsheet || !spreadsheet.length) {
        res.status(500).json({ error: "no spreadsheet sent" });
        return;
    } else {
        const regex = /\/d\/(.*)\//;
        const id = spreadsheet.match(regex);
        if (!id || !id.length) {
            res.status(500).json({ error: "no id found in spreadsheet. Should look like https://docs.google.com/spreadsheets/d/[letters-and-numbers]/" });
            return;
        }
        
        const images: any[] = [];
        const doc = new GoogleSpreadsheet(id[1], jwtFromEnv);
        
        doc.loadInfo().then(() => {
            const sheet = doc.sheetsByTitle['marc cull ai annotation experiment'];
            sheet.loadCells().then((cells) => {
                let imageCol = 0;
                //find the column with the image urls
                for (let i = 0; i < sheet.columnCount; i++) {
                    const cell = sheet.getCell(1, i);
                    const val = cell.value?.toString();
                    if (val && val.startsWith('https://')) {
                        imageCol = i;
                        break;
                    }
                }

                //add a new image description column
                const descriptionCol = sheet.columnCount;
                const descriptionColHeading = `AI Descriptions_${Date.now()}`;
                console.log('Adding column: ', descriptionColHeading);  
                console.log('current cell value: ' + cells[0][descriptionCol].value);
                cells[0][descriptionCol].value = descriptionColHeading;
                sheet.saveUpdatedCells().then(() => {
                    //fetch all the images
                    for (let i = 1; i < sheet.rowCount; i++) {
                        const cell = sheet.getCell(i, imageCol);
                        const val = cell.value?.toString();
                        if (val && val.startsWith('https://')) {
                            images.push({row: i, col: imageCol, imageUrl: val});
                        }
                    }
                res.status(200).json(
                    { message: 'success', 
                      images: images,
                      descriptionCol: descriptionCol
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: JSON.stringify(err) });
                });

                
            }) 
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ error: JSON.stringify(err) });
        });
        
        
    }
}