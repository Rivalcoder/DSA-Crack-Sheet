const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../My Sheet.xlsx');
console.log('Reading file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(name => {
        console.log(`--- Sheet: ${name} ---`);
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log('Total Rows:', data.length);
        console.log('First 10 rows:');
        data.slice(4, 20).forEach((row, i) => console.log(`${i + 4}:`, JSON.stringify(row)));
    });
} catch (error) {
    console.error('Error reading file:', error);
}
