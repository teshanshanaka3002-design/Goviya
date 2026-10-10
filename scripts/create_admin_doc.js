const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD9Y_M2NhtWSPag-aksNtqqNRDGYREhv3w",
  authDomain: "goviya-ce706.firebaseapp.com",
  projectId: "goviya-ce706",
  storageBucket: "goviya-ce706.firebasestorage.app",
  messagingSenderId: "313736003845",
  appId: "1:313736003845:web:72ce137e2e4f25ebec376c"
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const email = "isuru@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "isuru123";

  console.log(`Authenticating as ${email}...`);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  console.log(`Successfully authenticated! UID: ${uid}`);

  const userDocRef = doc(db, 'users', uid);
  const existing = await getDoc(userDocRef);

  if (existing.exists() && existing.data().role === 'admin') {
    console.log(`Admin document already exists with role: 'admin'!`);
    console.log(JSON.stringify(existing.data(), null, 2));
    return;
  }

  console.log(`Creating/updating Firestore document users/${uid}...`);
  await setDoc(userDocRef, {
    _id: uid,
    uid: uid,
    name: "Isuru Admin",
    email: email,
    role: "admin",
    verified: true,
    isDeactivated: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  console.log(`Successfully created Firestore users/${uid} document!`);
  const finalSnap = await getDoc(userDocRef);
  console.log(JSON.stringify(finalSnap.data(), null, 2));
}

main().catch(err => {
  console.error("Error creating admin document:", err.message);
  process.exit(1);
});
