import { Prisma, PrismaClient } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { Database } from "@universe/loaders/database";

const prisma = new PrismaClient();

export const PrismaOrder = Prisma.SortOrder;

export type IPrismaTransaction =
    | typeof prisma
    | Omit<
        PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >;

export interface IPrismaOptions {
    transaction?: IPrismaTransaction | typeof Database.instance;
}

export interface IGetOptionsPrisma {
    transaction?: IPrismaTransaction;
}
