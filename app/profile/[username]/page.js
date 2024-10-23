"use client"; // Ensure this is running on the client side

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Use this to extract URL params in App Router
import { useUser } from "@auth0/nextjs-auth0/client"; // Auth0 hook to get user info

export default function ProfilePage() {
	const { username } = useParams(); // Extract username (profile owner's username) from the URL
	const { user } = useUser(); // Get the logged-in user (if any)
	const [notes, setNotes] = useState([]);
	const [pendingNotes, setPendingNotes] = useState([]);
	const [newNote, setNewNote] = useState("");

	// Fetch approved notes for the profile owner
	useEffect(() => {
		if (username) {
			fetch(`/api/get-approved-notes?receiver_id=${username}`)
				.then((res) => res.json())
				.then((data) => setNotes(data.notes));
		}
	}, [username]);

	// Fetch pending notes for profile owner if logged in and visiting own profile
	useEffect(() => {
		if (user && user.nickname === username) {
			fetch(`/api/get-unapproved-notes?receiver_id=${username}`)
				.then((res) => res.json())
				.then((data) => setPendingNotes(data.notes));
		}
	}, [user, username]);

	// Handle submitting a note
	const handleSubmitNote = async (e) => {
		e.preventDefault();

		if (!newNote) {
			alert("The note cannot be empty.");
			return;
		}

		// Use the logged-in user's nickname as author_id, or "anonymous" if logged out
		const author_id = user ? user.nickname : "anonymous";

		const response = await fetch("/api/submit-note", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ note: newNote, receiver_id: username, author_id }), // Use the URL's username as the receiver_id
		});

		const result = await response.json();

		if (response.ok) {
			setNewNote(""); // Clear the note field after successful submission
			alert("Note submitted successfully and is awaiting approval.");
		} else {
			console.error("Error response:", result); // Log any errors
			alert(`Failed to submit the note: ${result.error}`);
		}
	};

	// Handle approving a note
	const handleApproveNote = async (id) => {
		try {
			const response = await fetch(`/api/approve-note`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			const result = await response.json();

			// Log the response for debugging
			console.log("Approval Response:", result);

			if (response.ok) {
				const approvedNote = pendingNotes.find((note) => note.id === id);
				setPendingNotes(pendingNotes.filter((note) => note.id !== id)); // Remove the note from pending
				setNotes([...notes, approvedNote]); // Add it to approved notes
			} else {
				alert(`Failed to approve the note: ${result.error}`);
			}
		} catch (error) {
			console.error("Error approving the note:", error);
		}
	};

	// Handle deleting a note
	const handleDeleteNote = async (id) => {
		const response = await fetch(`/api/delete-note`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id }),
		});

		if (response.ok) {
			setNotes(notes.filter((note) => note.id !== id)); // Remove the note from approved
			setPendingNotes(pendingNotes.filter((note) => note.id !== id)); // Remove from pending too, if applicable
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-black text-white'>
			<main className='flex flex-col justify-center gap-8 items-center'>
				<h1 className='text-4xl font-extrabold tracking-tight'>
					Profile of {username}
				</h1>

				{/* If the logged-in user is visiting their own profile */}
				{user && user.nickname === username ? (
					<>
						<h2 className='mt-4 text-2xl text-zinc-400'>
							Pending Notes for Approval:
						</h2>
						{pendingNotes.length > 0 ? (
							pendingNotes.map((note) => (
								<div
									key={note.id}
									className='p-4 bg-zinc-800 rounded-lg shadow-md mt-2 flex items-center justify-between w-full max-w-lg'
								>
									<p className='text-white'>{note.note}</p>
									<div className='flex gap-2'>
										<button
											onClick={() => handleApproveNote(note.id)}
											className='px-3 py-2 text-green-500 hover:text-green-300'
											aria-label='Approve'
										>
											✔️
										</button>
										<button
											onClick={() => handleDeleteNote(note.id)}
											className='px-3 py-2 text-red-500 hover:text-red-300'
											aria-label='Delete'
										>
											❌
										</button>
									</div>
								</div>
							))
						) : (
							<p className='text-zinc-500'>No pending notes for approval.</p>
						)}

						{/* Logout Button */}
						<a
							href='/api/auth/logout'
							className='mt-6 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-400'
						>
							Logout
						</a>
					</>
				) : (
					// Show the form for logged-out users to submit a note
					<form
						onSubmit={handleSubmitNote}
						className='flex flex-col items-center mt-4 w-full max-w-lg'
					>
						<textarea
							value={newNote}
							onChange={(e) => setNewNote(e.target.value)}
							placeholder='Leave a note'
							className='w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500'
						/>
						<button
							type='submit'
							className='mt-4 px-6 py-3 bg-zinc-600 text-white rounded-full hover:bg-zinc-500'
						>
							Submit Note
						</button>
					</form>
				)}

				<h2 className='mt-6 text-2xl text-zinc-400'>Approved Notes:</h2>
				{notes.length > 0 ? (
					notes.map((note) => (
						<div
							key={note.id}
							className='p-4 bg-zinc-700 rounded-lg shadow-md mt-2 w-full max-w-lg'
						>
							<p className='text-white'>{note.note}</p>
							{user && user.nickname === username && (
								<button
									onClick={() => handleDeleteNote(note.id)}
									className='mt-2 px-3 py-2 text-red-500 hover:text-red-300'
									aria-label='Delete'
								>
									❌
								</button>
							)}
						</div>
					))
				) : (
					<p className='text-zinc-500'>No approved notes yet.</p>
				)}
			</main>
		</div>
	);
}
