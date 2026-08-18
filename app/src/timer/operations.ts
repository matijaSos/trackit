import type { TimeEntry } from "wasp/entities";
import type {
  CreateTimeEntry,
  GetAllTimeEntriesByUser,
  UpdateTimeEntry,
} from "wasp/server/operations";
import { HttpError } from "wasp/server";

export const createTimeEntry: CreateTimeEntry<
  Pick<TimeEntry, "description" | "start">,
  TimeEntry
> = async ({ description, start }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const newTimeEntry = await context.entities.TimeEntry.create({
    data: {
      description,
      start,
      user: { connect: { id: context.user.id } },
    },
  });

  return newTimeEntry;
};

export const getAllTimeEntriesByUser: GetAllTimeEntriesByUser<
  void,
  TimeEntry[]
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.TimeEntry.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateTimeEntry: UpdateTimeEntry<
  Partial<TimeEntry>,
  TimeEntry
> = async ({ id, description, start, stop }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const timeEntry = await context.entities.TimeEntry.update({
    where: {
      id,
    },
    data: {
      description,
      start,
      stop,
    },
  });

  return timeEntry;
};
