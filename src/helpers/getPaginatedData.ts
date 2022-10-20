interface PaginationParameters {
    take: number;
    skip: number;
    count: number;
    data: Array<any>;
}

export const getPaginatedData = (
    {
        take,
        count,
        skip,
        data
    }: PaginationParameters
) => (
    {
        quantityPerPage: take,
        totalQuantity: count,
        currentPage: skip / take + 1,
        lastPage: Math.ceil(count / take),
        data: data
    }
);