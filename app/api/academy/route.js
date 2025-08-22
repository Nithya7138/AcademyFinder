// import Atlas_Db_connection from "../../../lib/mondodb.js";
// import Academidata from "../../../models/Academy.js";

// export async function connectToDatabase() {
//     try{
//         await Atlas_Db_connection();
//         const body = await request.json();
//         const academidata = await Academidata.create(body);
//         return Response.json(academidata);

//     }catch (error) {
//         console.error("Error connecting to database:", error);
//     }
// }

// export async function GET(){
//     try{
//         await Atlas_Db_connection();
//         const academidata = await Academidata.find();
//         return Response.json(academidata);
//     }catch (error) {
//         console.error("Error fetching data:", error);
//     }
// }

// app/api/academy/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Atlas_Db_connection from "../../../lib/mongodb";
import Academidata from "../../../models/Academy";

export async function GET(req) {
  try {
    await Atlas_Db_connection();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    let academidata;
    if (name) {
      academidata = await Academidata.findOne({ name });
    } else {
      academidata = await Academidata.find();
    }

    return NextResponse.json(academidata, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Require auth cookie
    const auth = cookies().get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Atlas_Db_connection();
    const body = await req.json();
    const academidata = await Academidata.create(body);
    return NextResponse.json(academidata, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
export async function PUT(req) {
  try {
    // Require auth cookie
    const auth = cookies().get("auth")?.value;
    if (auth !== "ok") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Atlas_Db_connection();
    const body = await req.json();
    const { id } = body;
    const academidata = await Academidata.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(academidata, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
