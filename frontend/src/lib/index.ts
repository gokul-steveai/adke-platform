export const extractMetrics = (text: string) => {
  const findValue = (label: string) => {
    const regex = new RegExp(`${label}:\\s*([\\d.]+)`, 'i');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  };

  const used = findValue('Used Memory');
  const total = findValue('Total Memory');

  return { used, total };
};