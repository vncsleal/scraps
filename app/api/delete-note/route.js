import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
	try {
		const { id } = await req.json();

		// Check if the note ID is provided
		if (!id) {
			return NextResponse.json(
				{ error: "Note ID is required" },
				{ status: 400 }
			);
		}

		// Delete the note with the given ID
		const { data, error } = await supabase.from("notes").delete().eq("id", id);

		if (error) {
			console.error("Supabase error:", error); // Log the Supabase error
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ message: "Note deleted successfully!" },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Server error:", err); // Log any server error
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
