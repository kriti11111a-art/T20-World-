// Converts Arabic/Persian/fullwidth digits and decimal separators to a clean Western decimal string
export const normalizeAmount = (input) => {
  const western = String(input || '')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[\uFF10-\uFF19]/g, (d) => String(d.charCodeAt(0) - 0xFF10))
    .replace(/[\u066B\u060C,\uFF0E]/g, '.')
    .replace(/[^0-9.]/g, '');
  const [whole, ...rest] = western.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
};

export default normalizeAmount;
