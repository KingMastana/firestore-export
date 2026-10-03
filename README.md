# firestore-export

A small Node.js toolkit that exports all top-level collections from a Firestore database to JSON, then converts that JSON into one CSV file per collection.

## Features

- Export every top-level collection and document to `backup.json`
- Convert `backup.json` into one CSV file per collection
- Flatten nested objects using dot notation
- Preserve Firestore document IDs in an `__id` column
- No extra runtime dependencies for the CSV conversion step

## Requirements

- Node.js 14 or later
- A Firebase project with Firestore enabled
- A Google Cloud service account with permission to read Firestore data

## Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/KingMastana/firestore-export.git
   cd firestore-export
   npm install
   ```

2. Download a service account key:

   - Open the [Google Cloud Console](https://console.cloud.google.com/).
   - Go to **IAM & Admin > Service Accounts**.
   - Select an existing service account or create a new one.
   - Click the **Keys** tab, then **Add Key > Create new key**.
   - Choose **JSON** and download the file.

3. Rename the downloaded file to `credentials.json` and place it in the project root.

4. Open `export.js` and replace `YOUR_PROJECT_ID` with your actual Firebase project ID:

   ```js
   const firestore = new Firestore({
     projectId: 'your-actual-project-id',
     keyFilename: 'credentials.json'
   });
   ```

5. Make sure private and generated files are ignored by Git. Add this to `.gitignore`:

   ```gitignore
   credentials.json
   backup.json
   csv/
   ```

   Never commit `credentials.json` or exported data to version control.

## Usage

### 1. Export Firestore to JSON

Run the export script:

```bash
node export.js
```

If everything is configured correctly, you will see:

```text
Backup completed successfully!
```

The script writes all exported data to `backup.json` in the current directory. The structure is:

```json
{
  "collectionName": {
    "documentId": {
      "field": "value"
    }
  }
}
```

Only top-level collections are exported. Subcollections are not included.

### 2. Convert JSON to CSV

Run the conversion script:

```bash
node convert-to-csv.js
```

The script reads `backup.json` and writes one CSV file per collection into the `csv/` directory.

Example output:

```text
Wrote 42 rows to csv/users.csv
Wrote 17 rows to csv/orders.csv
Conversion completed successfully!
```

## CSV Behavior

- One CSV file is created per top-level collection.
- The header row contains the union of all field names found in that collection.
- Missing fields are written as empty cells.
- Nested objects are flattened using dot notation. For example, `address.city`.
- Arrays are written as JSON strings, since CSV has no native array type.
- Firestore document IDs are included in a column named `__id`.
- Values containing commas, quotes, or newlines are quoted and escaped per RFC 4180.

## Project Structure

```text
.
├── export.js
├── convert-to-csv.js
├── package.json
└── README.md
```

After running the scripts, you will also have:

```text
backup.json
csv/
```

## Notes

- The export script only handles top-level collections. Subcollections require additional traversal logic.
- The service account needs the `roles/datastore.user` role or equivalent read access to Firestore.
- Keep `credentials.json` private. If it is accidentally exposed, revoke the key in the Google Cloud Console and generate a new one.
- `backup.json` and the generated CSV files may contain sensitive data. Do not commit them to a public repository.

## License

MIT