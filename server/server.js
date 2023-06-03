const express = require('express');
const path = require('path');
const process = require('process');
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require('cors');
const fs = require('fs').promises;
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
require('dotenv').config();
const fetch = require('node-fetch');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.post('/api/sms', async (req, res) => {
  // create random 4 digit security code
  const securityCode = Math.floor(1000 + Math.random() * 9000);
  // convert phoneNumber to string with +1 prefix
  const phoneNumber = '+1' + req.body.phoneNumber;
  let url = 'https://neutrinoapi.net/sms-verify';
  let options = {
    method: 'POST',
    headers: {
      'API-Key': process.env.NEUTRINO_API_KEY,
      'User-ID': process.env.NEUTRINO_USER_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: phoneNumber,
      'security-code': securityCode,
      'code-length': 4,
      'language-code': 'en',
      limit: 10,
      'limit-ttl': 1,
    }),
  };

  resp = await fetch(url, options).then((res) => res.json());

  res.json(resp);
});

app.post('/api/validate', async (req, res) => {
  let { phoneNumber } = req.body;
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = path.join(process.cwd(), 'token.json');
  const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  async function listMembers(auth, phoneNumber) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '17HU1It5t6ORStwjVJ9GXgk10nlEXMmwF_aphVQ65Xww',
      range: 'Members!A2:C',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    // convert rows to array of objects
    const members = rows.map((row) => {
      return {
        phoneNumber: row[0].replace(/-/g, ''),
        firstName: row[1],
        lastName: row[2],
        isValid: false,
      };
    });
    // check if phone number matches any members
    phoneNumber = phoneNumber.replace(/-/g, '');
    let details = members.filter((member) => member.phoneNumber == phoneNumber);
    if (details.length > 0) {
      details[0].isValid = true;
      return details[0];
    } else {
      return {
        isValid: false,
        phoneNumber: phoneNumber,
      };
    }
  }

  async function main() {
    const auth = await authorize();
    let details = await listMembers(auth, phoneNumber);
    return details;
  }

  details = await main().catch(console.error);
  res.json(details);
});

// start express server
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
