import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs'
import { ServiceAccount } from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseConfigService {
  private firebaseApp: admin.app.App;

  constructor() {
    const configPath = path.join(process.cwd(), 'config', 'firebase-key.json');
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const serviceAccount: ServiceAccount = JSON.parse(raw);

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error loading Firebase configuration:', error);
      throw error;
    }
  }                  

  getFirebaseAdmin() {
    return this.firebaseApp;
  }
} 