import { GoogleSpreadsheet, GoogleSpreadsheetCell } from 'google-spreadsheet';
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

export default async function handler(req, res) {
    const spreadsheet = req.body.spreadsheet;
    const sheetName = req.body.sheet;
    const doc = new GoogleSpreadsheet(spreadsheet, jwtFromEnv);     
    try {
        await doc.loadInfo();
        const sheet = (sheetName && sheetName.length) > 0 ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0];
        let cells = await sheet.loadCells({ // GridRange object
            startRowIndex: 0, 
            endRowIndex: 2, 
            startColumnIndex:0, 
            endColumnIndex: sheet.columnCount-1
            });
            

        //get image column
        let imageCol = 0;
        for (let i = 0; i < sheet.columnCount; i++) {
            const cell = sheet.getCell(1, i);
            const val = cell.value?.toString();
            if (val && val.startsWith('https://')) {
                imageCol = i;
                break;
            }
        }

        //add a column for the AI descriptions
        let imageDescriptionCol = 0;
        for (let i = 0; i < sheet.columnCount; i++) {
            const cell = sheet.getCell(0, i);
            const val = cell.value?.toString();
            if (!val || val.length === 0) {
                imageDescriptionCol = i;
                cell.value = `AI Descriptions_${Date.now()}`;
                await sheet.saveCells([cell]);
                break;
            }
        }

        //get all the image urls
        await sheet.loadCells({ // GridRange object
            startRowIndex: 0, 
            endRowIndex: sheet.rowCount, 
            startColumnIndex: imageCol - 1, 
            endColumnIndex: imageCol + 1
            });
            
            
        const images: any[] = [];
        
        for (let i = 1; i < sheet.rowCount; i++) {
            const cell = sheet.getCell(i, imageCol);
            const val = cell.value?.toString();
            if (val && val.startsWith('https://')) {
                images.push({row: i, imageUrl: val});
            }
        }

        res.status(200).json(
            { message: 'success', 
            images: images,
            descriptionCol: imageDescriptionCol,
            });
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).json({ error: JSON.stringify(err) });
    }
}