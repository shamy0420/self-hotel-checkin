/**
 * Script to populate Firestore with 50 normal rooms and 50 premium rooms
 * Run with: npm run populate-rooms
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the service account key file
const serviceAccountPath = join(__dirname, '../../clixsys-smart-mirror-firebase-adminsdk-fbsvc-070c719f27.json');

let serviceAccount;
try {
  const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountData);
} catch (error) {
  console.error('❌ Service account key file not found at:', serviceAccountPath);
  console.error('Please ensure the Firebase Admin SDK key file is in the project root directory.');
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Room templates
const normalRoomTemplate = {
  name: '',
  description: 'Comfortable room with modern amenities, free WiFi, and essential facilities',
  price: 99,
  capacity: 2,
  available: true,
  type: 'normal',
  image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
  amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom'],
  createdAt: new Date().toISOString()
};

const premiumRoomTemplate = {
  name: '',
  description: 'Luxurious room with premium features, stunning views, and premium amenities',
  price: 249,
  capacity: 4,
  available: true,
  type: 'premium',
  image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
  amenities: ['WiFi', 'Smart TV', 'AC', 'Private Bathroom', 'Mini Bar', 'Room Service', 'Balcony'],
  createdAt: new Date().toISOString()
};

async function populateRooms() {
  try {
    console.log('Starting room population...');
    
    const batch = db.batch();
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore batch limit
    
    // Add 50 normal rooms
    for (let i = 1; i <= 50; i++) {
      const room = {
        ...normalRoomTemplate,
        name: `Normal Room ${i}`,
        roomNumber: `N${String(i).padStart(3, '0')}`
      };
      
      const roomRef = db.collection('Rooms').doc();
      batch.set(roomRef, room);
      batchCount++;
      
      if (batchCount >= maxBatchSize) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} rooms`);
        batchCount = 0;
      }
    }
    
    // Add 50 premium rooms
    for (let i = 1; i <= 50; i++) {
      const room = {
        ...premiumRoomTemplate,
        name: `Premium Room ${i}`,
        roomNumber: `P${String(i).padStart(3, '0')}`
      };
      
      const roomRef = db.collection('Rooms').doc();
      batch.set(roomRef, room);
      batchCount++;
      
      if (batchCount >= maxBatchSize) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} rooms`);
        batchCount = 0;
      }
    }
    
    // Commit remaining rooms
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} rooms`);
    }
    
    console.log('✅ Successfully created 100 rooms (50 normal + 50 premium)');
    console.log('Rooms are now available in Firestore under the "Rooms" collection');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating rooms:', error);
    process.exit(1);
  }
}

// Run the script
populateRooms();

