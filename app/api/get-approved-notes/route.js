import { NextResponse } from "next/server"; // Add this import
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const receiver_id = searchParams.get("receiver_id");

		if (!receiver_id) {
			return NextResponse.json(
				{ error: "receiver_id is required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("notes")
			.select("*")
			.eq("receiver_id", receiver_id)
			.eq("is_approved", true);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ notes: data }, { status: 200 });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
