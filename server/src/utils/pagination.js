export const buildPagination = ({ page = 1, limit = 10 }) => {
  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.max(Number(limit) || 10, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip
  };
};

export const buildPaginationResponse = ({ totalItems, page, limit }) => ({
  totalItems,
  currentPage: page,
  pageSize: limit,
  totalPages: Math.max(Math.ceil(totalItems / limit), 1),
  hasPreviousPage: page > 1,
  hasNextPage: page < Math.max(Math.ceil(totalItems / limit), 1)
});
