import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    console.log('Connecting to MongoDB...', MONGODB_URI); // Debugging
    await mongoose.connect(MONGODB_URI, {
      dbName: 'yourDatabaseName', // Replace with your database name
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default dbConnect;
