"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    window.location.href = "/";
    return;
  }

  // remove token from URL
  if (window.location.hash) {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }

  loadBookmarks();
  realtime();
}

  async function loadBookmarks() {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  }

  function realtime() {
    supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => loadBookmarks()
      )
      .subscribe();
  }

  async function addBookmark() {
    if (!title || !url) return alert("Enter title & URL");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user?.id,
      },
    ]);

    await loadBookmarks();
    setTitle("");
    setUrl("");
  }

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
    await loadBookmarks();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🔖 Smart Bookmarks</h1>

          <button
            onClick={logout}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-80"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark Card */}
        <div className="bg-white p-4 rounded shadow mb-6 space-y-3">
          <h2 className="font-semibold text-lg">Add Bookmark</h2>

          <input
            className="border p-3 w-full rounded"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border p-3 w-full rounded"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:opacity-90"
          >
            Add Bookmark
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-3">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks yet.
            </p>
          )}

          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <a
                href={b.url}
                target="_blank"
                className="text-blue-600 font-medium hover:underline"
              >
                {b.title}
              </a>

              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
