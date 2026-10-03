const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');

const firestore = new Firestore({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: 'credentials.json'
});

async function backup() {
  const collections = await firestore.listCollections();
  const dbData = {};

  for (let collection of collections) {
    dbData[collection.id] = {};
    const snapshot = await collection.get();
    snapshot.forEach(doc => {
      dbData[collection.id][doc.id] = doc.data();
    });
  }

  fs.writeFileSync('backup.json', JSON.stringify(dbData, null, 2));
  console.log('Backup completed successfully!');
}

backup().catch(console.error);