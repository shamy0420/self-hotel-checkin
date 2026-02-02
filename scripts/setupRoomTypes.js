/**
 * Script to set up RoomTypes collection with Normal and Premium room types
 * Each type has 50 total rooms
 * Run with: npm run setup-room-types
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

const roomTypes = [
  {
    name: 'Normal Room',
    description: 'Comfortable room with modern amenities, free WiFi, and essential facilities',
    price: 99,
    capacity: 2,
    totalCount: 50,
    type: 'normal',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
    amenities: ['WiFi', 'TV', 'AC', 'Private Bathroom'],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Premium Room',
    description: 'Luxurious room with premium features, stunning views, and premium amenities',
    price: 249,
    capacity: 4,
    totalCount: 50,
    type: 'premium',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
    amenities: ['WiFi', 'Smart TV', 'AC', 'Private Bathroom', 'Mini Bar', 'Room Service', 'Balcony'],
    createdAt: new Date().toISOString()
  }
];

async function setupRoomTypes() {
  try {
    console.log('Setting up RoomTypes collection...');
    
    // Check if room types already exist
    const existingTypes = await db.collection('RoomTypes').get();
    
    if (!existingTypes.empty) {
      console.log('⚠️  RoomTypes collection already exists. Updating existing types...');
      
      // Update existing room types
      for (const doc of existingTypes.docs) {
        const data = doc.data();
        const matchingType = roomTypes.find(rt => rt.type === data.type);
        
        if (matchingType) {
          await doc.ref.update({
            ...matchingType,
            totalCount: 50 // Ensure totalCount is 50
          });
          console.log(`✅ Updated ${matchingType.name}`);
        }
      }
    } else {
      // Create new room types
      for (const roomType of roomTypes) {
        await db.collection('RoomTypes').add(roomType);
        console.log(`✅ Created ${roomType.name} with ${roomType.totalCount} total rooms`);
      }
    }
    
    console.log('✅ RoomTypes setup complete!');
    console.log('   - Normal Room: 50 total rooms');
    console.log('   - Premium Room: 50 total rooms');
    console.log('   Available count will decrease as rooms are booked.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up room types:', error);
    process.exit(1);
  }
}

// Run the script
setupRoomTypes();


