export function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function parseArrayField(field) {
  try {
    const cleaned = field.replace(/^"/, '').replace(/"$/, '').trim();

    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      const arrayContent = cleaned.slice(1, -1);
      if (!arrayContent.trim()) return [];

      return arrayContent.split(',').map(item =>
        item.replace(/'/g, '').replace(/"/g, '').trim()
      ).filter(item => item.length > 0);
    }

    return cleaned.split(',').map(item => item.trim()).filter(item => item.length > 0);
  } catch (error) {
    console.error('Error parsing array field:', field, error);
    return [];
  }
}
