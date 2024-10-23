"use client"; // Ensure this runs on the client side

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation"; // Correct import for App Router
import { useEffect } from "react";

export default function Home() {
	const { user = null } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			// Redirect to the user's profile page if they are logged in
			router.push(`/profile/${user.nickname}`);
		}
	}, [user, router]);

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-black text-white'>
			<main className='flex flex-col justify-center gap-8 items-center'>
				<div className='text-5xl font-extrabold tracking-tight text-white'>
					Scraps
				</div>

				{!user ? (
					<div className='flex gap-4 items-center flex-col sm:flex-col'>
						<a
							href='/api/auth/login'
							className='rounded-full border border-solid border-zinc-500 transition-colors flex items-center justify-center bg-zinc
              -800 text-white hover:bg-zinc-700 hover:border-zinc-400 shadow-lg text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8'
						>
							Login
						</a>
					</div>
				) : (
					<p className='text-lg font-medium text-zinc-400'>
						Redirecting to your profile...
					</p>
				)}
			</main>

			<footer className='absolute bottom-4 text-sm text-zinc-400'>
				<a
					href='https://nextjs.org'
					target='_blank'
					rel='noopener noreferrer'
					className='hover:underline hover:text-zinc-300'
				>
					Powered by Next.js
				</a>
			</footer>
		</div>
	);
}
