"use client";

import { supabase } from "@/lib/supabase";

export default function Home() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
  redirectTo: `${window.location.origin}/dashboard`,
},
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center space-y-6">

        <h1 className="text-3xl font-bold">🔖 Smart Bookmark</h1>

        <p className="text-gray-600">
          Save and manage your favorite links securely in one place.
        </p>

        <button
          onClick={login}
          className="w-full bg-black text-white py-3 rounded hover:opacity-90 transition"
        >
          Continue with Google
        </button>

        <p className="text-sm text-gray-500">
          Login required to manage bookmarks
        </p>

      </div>
    </div>
  );
}
