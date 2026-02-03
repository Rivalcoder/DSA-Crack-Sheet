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
});

const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing existing problems...');
        await Problem.deleteMany({});

        const filePath = path.join(__dirname, '../inspect_excel.js').replace('inspect_excel.js', '../My Sheet.xlsx'); // Hacky but reliable relative to CWD if usually run from root
        // Better:
        const realPath = path.resolve(__dirname, '../../My Sheet.xlsx');
        console.log('Reading Excel:', realPath);

        const workbook = XLSX.readFile(realPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let currentSection = 'General';
        let problemsToInsert = [];

        // Start iterating. We saw headers around row 5.
        // We will scan all rows.
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const col0 = (row[0] || '').toString().trim();
            const col1 = (row[1] || '').toString().trim();

            // Detect Section
            // Criteria: col0 exists, col1 is empty, col0 doesn't start with "Pattern" or "Tip"
            // Also checks if strictly roman numeral start? "I. ", "II. ", "III. "
            if (col0 && !col1 && !col0.startsWith('Pattern') && !col0.startsWith('Tip') && (col0.match(/^[IVX]+\.\s/) || col0.includes('Patterns'))) {
                currentSection = col0;
                console.log(`Found Section: ${currentSection}`);
                continue;
            }

            // Detect Pattern
            if (col0.startsWith('Pattern') && col1) {
                const patternName = col0;
                const problemString = col1;

                // Parse problems
                // Split by comma
                // Some might have messy spaces or newlines?
                // "11. Container..., 15. 3Sum"
                const chunks = problemString.split(',').map(s => s.trim()).filter(s => s);

                for (const chunk of chunks) {
                    // chunk: "11. Container With Most Water"
                    // Regex: Start with digits, dot, space, title
                    const match = chunk.match(/^(\d+)\.\s*(.*)$/);
                    if (match) {
                        const pid = parseInt(match[1]);
                        const title = match[2].trim();
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                        const url = `https://leetcode.com/problems/${slug}/`;

                        problemsToInsert.push({
                            title,
                            problemId: pid,
                            url,
                            section: currentSection,
                            pattern: patternName,
                            slug
                        });
                    } else {
                        console.log(`Failed to parse problem chunk: "${chunk}" in pattern "${patternName}"`);
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
