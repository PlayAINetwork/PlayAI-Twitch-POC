import Task from "./auth";

import { Elysia } from "elysia";

const app = new Elysia({ name: "Router" }).use(Task);

export default app;
