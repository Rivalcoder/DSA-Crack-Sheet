const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const ProblemSchema = new mongoose.Schema({
    title: String,
    url: String,
    yt_url: String,
    difficulty: String,
    section: String,
    pattern: String,
    problemId: Number,
    slug: String,
    sheet: String,
    orderIndex: Number,
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const dataPath = path.join(__dirname, '../data/striver_extras.json');
        const problems = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const sheetsToClear = [...new Set(problems.map(p => p.sheet))];
        console.log(`Clearing existing data for sheets: ${sheetsToClear.join(', ')}`);

        // Clear existing problems for these specific sheets only
        await Problem.deleteMany({ sheet: { $in: sheetsToClear } });

        console.log(`Inserting ${problems.length} problems...`);

        // Insert in chunks to avoid overwhelming the connection
        const chunkSize = 100;
        for (let i = 0; i < problems.length; i += chunkSize) {
            const chunk = problems.slice(i, i + chunkSize);
            await Problem.insertMany(chunk);
            console.log(`Inserted ${Math.min(i + chunkSize, problems.length)}/${problems.length}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
