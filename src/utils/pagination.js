export const getPaginationData = (page, limit, totalItems) => {
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(totalItems / currentLimit);

  return {
    page: currentPage,
    limit: currentLimit,
    totalItems: parseInt(totalItems, 10),
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
};

export const getOffset = (page, limit) => {
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  return (currentPage - 1) * currentLimit;
};
