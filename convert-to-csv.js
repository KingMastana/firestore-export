const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'backup.json';
const OUTPUT_DIR = 'csv';

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  let str;
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (/[",\n\r]/.test(str)) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function flatten(obj, prefix, out) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      flatten(value, fullKey, out);
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

function toCsv(rows, headers) {
  const lines = [headers.map(escapeCsvValue).join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvValue(row[h])).join(','));
  }
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const collections = Object.keys(data);

  if (collections.length === 0) {
    console.log('No collections found in backup.json');
    return;
  }

  for (const name of collections) {
    const docs = data[name];
    const rows = [];
    const headerSet = new Set();

    for (const [docId, docData] of Object.entries(docs)) {
      const flat = flatten(docData || {}, '', {});
      flat.__id = docId;
      headerSet.add('__id');
      for (const key of Object.keys(flat)) headerSet.add(key);
      rows.push(flat);
    }

    const headers = Array.from(headerSet);
    const csv = toCsv(rows, headers);
    const outPath = path.join(OUTPUT_DIR, `${name}.csv`);
    fs.writeFileSync(outPath, csv);
    console.log(`Wrote ${rows.length} rows to ${outPath}`);
  }

  console.log('Conversion completed successfully!');
}

main();