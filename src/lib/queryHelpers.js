export const asItems = (result) => {
  if (Array.isArray(result)) return result;
  return result?.items || [];
};

export const sortByDate = (items, key = "event_date") =>
  [...items].sort((a, b) => {
    const left = new Date(`${a?.[key] || "1900-01-01"}T00:00:00`).getTime();
    const right = new Date(`${b?.[key] || "1900-01-01"}T00:00:00`).getTime();
    return left - right;
  });