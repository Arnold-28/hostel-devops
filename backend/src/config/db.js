const mongoose = require('mongoose');

let isConnected = false;

async function connectToMongo() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  isConnected = true;

  // eslint-disable-next-line no-console
  console.log('[backend] connected to mongo');
}

module.exports = { connectToMongo };
