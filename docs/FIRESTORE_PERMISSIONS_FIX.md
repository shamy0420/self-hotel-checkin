# Fix: "Missing or insufficient permissions" when searching rooms

This error means Firestore is rejecting the read. Your **firestore.rules** in this repo allow unauthenticated read on `RoomTypes` and `Bookings`; the fix is to deploy those rules to your Firebase project.

## Steps

1. **Set the Firebase project** (use your project ID; the app uses `clixsys-smart-mirror`):

   ```bash
   cd "/Users/mohamedel-shamy/Mirror App/self-checkin"
   firebase use clixsys-smart-mirror
   ```

   If that project isn’t linked yet:

   ```bash
   firebase use --add
   ```
   Then pick the project and optionally give it an alias (e.g. `default`).

2. **Deploy only Firestore rules**:

   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Retry** “Search Rooms” in the app. It should work without signing in.

## If you use a different project ID

Replace `clixsys-smart-mirror` with your project ID in the `firebase use` command. Your app’s project ID is in **src/boot/firebase.js** (`projectId` in `firebaseConfig`).

## What the deployed rules allow

- **RoomTypes**, **Bookings**, **bookings**, **Rooms**, **rooms**: anyone can **read** (no login).
- **Writes**: only as defined in **firestore.rules** (e.g. create booking with valid fields, update to set `verified`, admin-only for RoomTypes/Rooms).

If you changed rules in the **Firebase Console**, deploying with the command above overwrites them with the rules from **firestore.rules** in this repo.
