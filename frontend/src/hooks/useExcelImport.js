import * as XLSX from '@e965/xlsx';

// Parses an .xlsx/.xls/.csv file into normalized row objects.
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) return reject(new Error('No data found in the file'));

        const normalise = (obj) => {
          const result = {};
          for (const k of Object.keys(obj)) {
            result[k.toLowerCase().trim()] = String(obj[k]).trim();
          }
          return result;
        };

        const parsed = rows.map(normalise);
        const allKeys = Object.keys(parsed[0]);
        const nameKey = allKeys.find((k) => k.includes('name')) || allKeys[0];
        const emailKey = allKeys.find((k) => k.includes('email')) || allKeys[1];

        const excelData = parsed
          .map((r) => ({
            ...r,
            name: r[nameKey] || '',
            email: emailKey ? r[emailKey] || '' : '',
          }))
          .filter((r) => r.name || allKeys.some((k) => r[k]));

        if (!excelData.length) return reject(new Error('No valid rows found'));
        resolve({ excelData, columns: allKeys });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
