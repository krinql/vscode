import * as dotenv from 'dotenv';
dotenv.config();

export const BACKEND_ENDPOINT = "http://localhost:3000";
export const FRONTEND_ENDPOINT = 'http://localhost:3000';

export const FIREBASE_API_KEY = 'AIzaSyCDkSplsCexKg1Pn_4LtXqKiSNafXAs4zE';

export const LOGIN_URL = `${FRONTEND_ENDPOINT}/auth/external/vscode/login`;
export const LOGOUT_URL = `${FRONTEND_ENDPOINT}/auth/external/vscode/logout`;



