import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
	try {
		const { id } = await req.json();

		// Update the note's status to approved
		const { data, error } = await supabase
			.from("notes")
			.update({ is_approved: true })
			.eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ message: "Note approved successfully!" });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
