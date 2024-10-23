import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
	try {
		const { note, receiver_id, author_id } = await req.json();

		// Validate required fields
		if (!note || !receiver_id) {
			console.error("Missing fields:", { note, receiver_id });
			return NextResponse.json(
				{ error: "Note and receiver_id are required." },
				{ status: 400 }
			);
		}

		// If author_id is not provided (anonymous user), set it to "anonymous"
		const finalAuthorId = author_id || "anonymous";

		// Insert the note into the database
		const { data, error } = await supabase.from("notes").insert([
			{
				note,
				receiver_id,
				author_id: finalAuthorId, // Use the final author ID (either user or anonymous)
				is_approved: false, // All notes must be approved before displaying
			},
		]);

		if (error) {
			console.error("Supabase error:", error); // Log Supabase error
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.log("Note successfully inserted:", data); // Log success
		return NextResponse.json(
			{ message: "Note submitted successfully and is awaiting approval." },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Server error:", err); // Log any server error
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
