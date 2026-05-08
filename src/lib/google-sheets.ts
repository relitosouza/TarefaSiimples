import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
  console.warn('Variáveis de ambiente do Google Sheets não configuradas.');
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

export const getDoc = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

export const getSheet = async (title: string = 'Tarefas') => {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle[title];
  
  if (!sheet) {
    // Se a aba não existir, cria uma com os cabeçalhos padrão
    sheet = await doc.addSheet({ 
      title, 
      headerValues: ['ID', 'Tarefa', 'Status', 'Data_Criacao', 'Data_Conclusao'] 
    });
  }
  
  return sheet;
};
