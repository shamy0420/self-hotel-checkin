import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg',
  authDomain: 'clixsys-smart-mirror.firebaseapp.com',
  projectId: 'clixsys-smart-mirror',
  storageBucket: 'clixsys-smart-mirror.appspot.com',
  messagingSenderId: '446935159659',
  appId: '1:446935159659:web:4c3968646473b0629df22e',
  measurementId: 'G-FBPR6NBJL6'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (guarded for environments where it's supported)
let analytics;
if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = undefined;
    });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, auth, analytics };
