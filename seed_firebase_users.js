/**
 * METRAVOX Firebase User Seeder
 * ─────────────────────────────
 * Run ONCE to create the 3 authorized users in Firebase Authentication.
 *
 * Usage:
 *   node seed_firebase_users.js
 *
 * Prerequisites:
 *   npm install firebase-admin   (run this once in this folder)
 *
 * Steps to get serviceAccountKey.json:
 *   1. Go to https://console.firebase.google.com/project/metravox-374ef/settings/serviceaccounts/adminsdk
 *   2. Click "Generate new private key"
 *   3. Save as serviceAccountKey.json in this folder (d:\metra\)
 *   4. Run: node seed_firebase_users.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const USERS = [
  {
    email: 'prakash01.aleti@gmail.com',
    password: 'Applicant@2026',
    displayName: 'prakash',
    role: 'consumer'
  },
  {
    email: 'ramesh.varma.lmo@gov.in',
    password: 'Officer@2026',
    displayName: 'Ramesh varma',
    role: 'officer'
  },
  {
    email: 'rohith.admin@gov.in',
    password: 'Admin@2026',
    displayName: 'Rohith',
    role: 'admin'
  }
];

async function seedUsers() {
  console.log('\n🔥 METRAVOX Firebase User Seeder\n');

  for (const u of USERS) {
    try {
      // Try to create the user
      const record = await admin.auth().createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true
      });

      console.log(`✅ Created: ${u.displayName} (${u.email}) → UID: ${record.uid}`);

      // Also write to Firestore
      await admin.firestore().collection('users').doc(record.uid).set({
        uid: record.uid,
        email: u.email,
        name: u.displayName,
        role: u.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`   📄 Firestore profile created for ${u.displayName}`);

    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log(`⚠️  Already exists: ${u.email} — skipped`);
      } else {
        console.error(`❌ Error for ${u.email}:`, err.message);
      }
    }
  }

  console.log('\n✅ Seeding complete! You can now log in with these credentials.\n');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
