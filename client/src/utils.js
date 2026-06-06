export const formatDuration = decimalHours => {
  if (isNaN(decimalHours) || decimalHours === null) {
    return '0h 0m';
  }
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const roundDuration = totalSeconds => {
  const totalMinutes = totalSeconds / 60;
  const roundedMinutes = totalSeconds % 60 === 0 ? totalMinutes : Math.ceil(totalMinutes);
  const roundedHours = roundedMinutes / 60;
  return roundedHours;
};
