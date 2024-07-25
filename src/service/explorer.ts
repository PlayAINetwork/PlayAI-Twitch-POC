import { createId } from "@paralleldrive/cuid2";
import { db } from "../config";
import { type Context } from "elysia";
import { ErrorUtil } from "../util";

const getAllNodes = async () => {
  let user = await db.sql`SELECT * FROM "node"`;
  console.log(user);
  return { nodes: user };
};

const getUserNode = async (wallet: string) => {
  let user = await db.sql`SELECT * FROM "node" WHERE wallet =${wallet}`;
  if (!user.length) throw new ErrorUtil.HttpException(400, "User nor found");
  return {
    user: user[0]
  };
};

const getUptime = async (wallet: string) => {
  try {
    const user = await db.sql`SELECT * FROM "node" WHERE wallet = ${wallet}`;
    if (!user.length) {
      throw new ErrorUtil.HttpException(400, "User not found");
    }
    const { updatedAt, upTime } = user[0];
    console.log(updatedAt, upTime);
    const uptimeDifference = Math.floor((upTime - updatedAt) / (1000 * 60));
    let status: string;
    if (user[0].status === "healthy" && uptimeDifference > 0) {
      status = `Uptime: ${uptimeDifference} minutes`;
    } else {
      status = `Status: ${user[0].status}`;
    }
    console.log(status);
    return status;
  } catch (error) {
    throw new ErrorUtil.HttpException(500, `Failed to calculate uptime`);
  }
};

export { getAllNodes, getUserNode, getUptime };
