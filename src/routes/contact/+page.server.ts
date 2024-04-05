import type { Actions } from './$types'
import { google } from 'googleapis';
import { SHEET_ID, CLIENT_EMAIL, PRIVATE_KEY } from '$env/static/private'

const client = new google.auth.JWT(CLIENT_EMAIL, undefined, PRIVATE_KEY.replace(/\\n/g, '\n'), [
  'https://www.googleapis.com/auth/spreadsheets',
]);
const sheets = google.sheets({ version: 'v4', auth: client });

export const actions: Actions = {
  default: async ({ request, getClientAddress }) => {
    const data = await request.formData()
    const body = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      message: data.get('name') as string
    }

    const rows = Object.values(body)
    rows[3] = new Date().toISOString();
    rows[4] = getClientAddress();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:E',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rows],
      },
    });
    return { success: true }
  }
}