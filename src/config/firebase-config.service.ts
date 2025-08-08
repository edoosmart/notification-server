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
      if (!fs.existsSync(configPath)) {
        console.warn('Firebase config file not found, Firebase will be disabled');
        return;
      }
      
      const raw = fs.readFileSync(configPath, 'utf8');
      const serviceAccount: ServiceAccount = JSON.parse(raw);

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error loading Firebase configuration:', error);
      console.warn('Firebase will be disabled');
    }
  }                  

  getFirebaseAdmin() {
    if (!this.firebaseApp) {
      throw new Error('Firebase is not initialized. Please check your configuration.');
    }
    return this.firebaseApp;
  }
} 