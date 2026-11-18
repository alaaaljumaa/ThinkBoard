import mongoose from 'mongoose';
import dns from 'dns';

// Force Node to use IPv4
dns.setDefaultResultOrder('ipv4first');

const URI = process.env.MONGO_URI;
console.log('URI prefix:', URI?.slice(0, 15));

try {
  await mongoose.connect(URI, { 
    family: 4, // Force IPv4 in the driver
    serverSelectionTimeoutMS: 5000 
  });
  console.log('✅ Connected successfully!');
  await mongoose.disconnect();
} catch (err) {
  console.error('❌ Failed:', err.message);
}