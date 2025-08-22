// import mongoose from "mongoose";


// const Atlas_uri = process.env.DB_URI;
// if (!global.Atlasdbconnection) {
//     global.Atlasdbconnection = mongoose.createConnection(Atlas_uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });
// }

// else {
//     throw new Error("Database is not connected");
// }
// export default global.Atlasdbconnection;





import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define DB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn; // ✅ already connected
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
