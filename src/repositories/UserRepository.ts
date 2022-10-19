import { prisma } from "@/database";
import { RepositoryContract } from "@/interfaces";

import {
    User,
    Prisma
} from "@prisma/client";

const userPropertiesAvailableToSearch: Array<keyof User> = [
    "name",
    "email"
];

export class UserRepository implements RepositoryContract<User> {
    async create(userData: Prisma.UserCreateInput) {
        const user = await prisma.user.create(
            {
                data: userData
            }
        );

        return user;
    }

    async findOneBy(prop: keyof Prisma.UserWhereInput, value: Prisma.UserWhereInput[typeof prop]) {
        const user = await prisma.user.findFirst(
            {
                where: {
                    [prop]: value,
                    deletedAt: null
                }
            }
        );

        return user;
    }

    async findAll(
        {
            take,
            skip,
            search,
            sortColumn,
            sortDirection
        }: RepositoryContract.SearchFilters<User>
    ) {
        const searchLikeList = [];
        if (search)
            searchLikeList.push(
                ...userPropertiesAvailableToSearch.map(
                    userProperty => (
                        {
                            [userProperty]: {
                                contains: search
                            }
                        }
                    )
                )
            );

        const users = await prisma.user.findMany(
            {
                take,
                skip,

                where: {
                    OR: searchLikeList,
                    deletedAt: null
                },

                orderBy: {
                    [sortColumn]: sortDirection
                }
            }
        );

        return users;
    }

    async countAll(
        {
            take,
            skip,
            search,
            sortColumn,
            sortDirection
        }: RepositoryContract.SearchFilters<User>
    ) {
        const searchLikeList = [];
        if (search)
            searchLikeList.push(
                ...userPropertiesAvailableToSearch.map(
                    userProperty => (
                        {
                            [userProperty]: {
                                contains: search
                            }
                        }
                    )
                )
            );

        const usersCount = await prisma.user.count(
            {
                take,
                skip,

                where: {
                    OR: searchLikeList,
                    deletedAt: null
                },

                orderBy: {
                    [sortColumn]: sortDirection
                }
            }
        );

        return usersCount;
    }

    async update(id: number, userData: Prisma.UserUpdateInput) {
        const doesUserExist = await prisma.user.findFirst(
            {
                where: {
                    id,
                    deletedAt: null
                }
            }
        );
        if (!doesUserExist)
            return null;

        const user = await prisma.user.update(
            {
                where: {
                    id
                },

                data: userData
            }
        );

        return user;
    }

    async inactivate(id: number) {
        const doesUserExist = await prisma.user.findFirst(
            {
                where: {
                    id,
                    deletedAt: null
                }
            }
        );
        if (!doesUserExist)
            return null;

        const user = await prisma.user.update(
            {
                where: {
                    id
                },

                data: {
                    deletedAt: new Date()
                }
            }
        );

        return user;
    }
}