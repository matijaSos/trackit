import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { TimerPage } from "./TimerPage" with { type: "ref" };
import {
  createTimeEntry,
  getAllTimeEntriesByUser,
  updateTimeEntry,
} from "./operations" with { type: "ref" };

export const timerSpec: Spec = [
  route("TimerRoute", "/timer", page(TimerPage, { authRequired: true })),

  query(getAllTimeEntriesByUser, { entities: ["TimeEntry"] }),
  action(createTimeEntry, { entities: ["TimeEntry"] }),
  action(updateTimeEntry, { entities: ["TimeEntry"] }),
];
