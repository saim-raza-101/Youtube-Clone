import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);



export const DB_Connection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      "!! MongoDB Connection Successfully !! DB HOST:",
      connectionInstance.connection.host
    );
    try {
      await mongoose.connection.collection("users").dropIndex("authProvider_1_providerId_1");
      console.log("Dropped old index authProvider_1_providerId_1");
    } catch (e) {
      // ignore if index doesn't exist
    }
  } catch (error) {
    console.error("FAILED TO CONNECT DATABASE >>>", error);
    throw error;
  }
};
