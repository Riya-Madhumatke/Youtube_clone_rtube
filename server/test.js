import mongoose from "mongoose";

const uri =
  "mongodb+srv://kuldeep:YOUR_NEW_PASSWORD@cluster0.jjxgxoy.mongodb.net/mytube?retryWrites=true&w=majority&appName=Cluster0";

console.log("Connecting...");

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:");
    console.error(err);
    process.exit(1);
  });