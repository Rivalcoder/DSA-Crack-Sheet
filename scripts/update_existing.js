const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function updateExisting() {
    try {
        await mongoose.connect(MONGODB_URI);
        const result = await mongoose.connection.collection('problems').updateMany(
            { sheet: { $exists: false } },
            { $set: { sheet: 'Strivers 180' } }
        );
        console.log(`Updated ${result.modifiedCount} existing problems.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

updateExisting();
