const mongoose = require('mongoose');
const XLSX = require('xlsx');
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
    section: { type: String, required: true },
    pattern: { type: String, required: true },
    slug: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    sheet: { type: String, required: true },
    orderIndex: { type: Number, default: 0 }
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing existing Strivers 180 problems...');
        await Problem.deleteMany({ sheet: 'Strivers 180' });

        // ... (path setup)
        const realPath = path.resolve(__dirname, '../../My Sheet.xlsx');
        console.log('Reading Excel:', realPath);

        const workbook = XLSX.readFile(realPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let currentSection = 'General';
        let problemsToInsert = [];
        let globalOrder = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const col0 = (row[0] || '').toString().trim();
            const col1 = (row[1] || '').toString().trim();

            if (col0 && !col1 && !col0.startsWith('Pattern') && !col0.startsWith('Tip') && (col0.match(/^[IVX]+\.\s/) || col0.includes('Patterns'))) {
                currentSection = col0;
                continue;
            }

            if (col0.startsWith('Pattern') && col1) {
                const patternName = col0;
                const problemString = col1;
                const chunks = problemString.split(',').map(s => s.trim()).filter(s => s);

                for (const chunk of chunks) {
                    const match = chunk.match(/^(\d+)\.\s*(.*)$/);
                    if (match) {
                        const pid = parseInt(match[1]);
                        const title = match[2].trim();
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                        const url = `https://leetcode.com/problems/${slug}/`;

                        globalOrder++;
                        problemsToInsert.push({
                            title,
                            problemId: pid,
                            url,
                            section: currentSection,
                            pattern: patternName,
                            slug,
                            sheet: 'Strivers 180',
                            orderIndex: globalOrder
                        });
                    }
                }
            }
        }

        console.log(`Parsed ${problemsToInsert.length} problems.`);
        if (problemsToInsert.length > 0) {
            await Problem.insertMany(problemsToInsert);
            console.log('Inserted problems into MongoDB.');
        }

        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
}

seed();
