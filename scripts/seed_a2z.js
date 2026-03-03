const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    problemId: { type: Number, required: true },
    url: { type: String, required: true },
    yt_url: { type: String },
    section: { type: String, required: true },
    pattern: { type: String, required: true },
    slug: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    sheet: { type: String, required: true },
    orderIndex: { type: Number, default: 0 },
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing existing A2Z problems...');
        await Problem.deleteMany({ sheet: 'Striver A2Z' });

        const dataPath = path.join(__dirname, '../data/striver_a2z_final.json');
        console.log('Reading JSON:', dataPath);

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const problems = JSON.parse(rawData);

        console.log(`Parsed ${problems.length} problems.`);
        if (problems.length > 0) {
            await Problem.insertMany(problems);
            console.log('Inserted problems into MongoDB.');
        }

        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
}

seed();
