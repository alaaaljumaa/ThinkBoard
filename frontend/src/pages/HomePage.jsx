import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import RateLimitBanner from "../components/RateLimiter";
import { Link } from "react-router-dom";

const API_URL =import.meta.env.MODE==="development"?"http://localhost:5001/api/notes":"/api/notes" ;

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [retryAfter, setRetryAfter] = useState(60);

  // 🔹 حالة التعديل
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);

  // 🔹 حالة الحذف
  const [deletingId, setDeletingId] = useState(null);

  // ===== جلب الملاحظات =====
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);

      if (res.status === 429) {
        const seconds = Number(res.headers.get("Retry-After")) || 60;
        setRetryAfter(seconds);
        setIsRateLimited(true);
        toast.error(`Too many requests. Try again in ${seconds}s.`, {
          id: "rate-limit",
        });
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch notes (${res.status})`);

      const data = await res.json();
      setNotes(data.notes ?? []);
      setIsRateLimited(false);
    } catch (err) {
      const message =
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Is the backend running?"
          : err.message;
      toast.error(message, { id: "fetch-error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ===== حذف ملاحظة (Optimistic) =====
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;

    const previousNotes = notes;
    setDeletingId(id);
    setNotes((prev) => prev.filter((n) => n._id !== id)); // حذف فوري

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (res.status === 429) {
        setNotes(previousNotes);
        toast.error("Rate limit — slow down a bit.", { id: "rate-limit" });
        return;
      }
      if (!res.ok) throw new Error();

      toast.success("Note deleted ✅");
    } catch {
      setNotes(previousNotes); // تراجع
      toast.error("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== فتح نافذة التعديل =====
  const openEdit = (note) => {
    setEditingNote({ ...note });
  };

  // ===== حفظ التعديل =====
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingNote) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${editingNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingNote.title.trim(),
          content: editingNote.content.trim(),
        }),
      });

      if (res.status === 429) {
        toast.error("Rate limit — try again shortly.", { id: "rate-limit" });
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === data.note._id ? data.note : n)),
      );
      toast.success("Note updated ✏️");
      setEditingNote(null);
    } catch {
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => fetchNotes();
  const handleDismiss = () => setIsRateLimited(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Navbar />

      {isRateLimited && (
        <RateLimitBanner
          resetSeconds={retryAfter}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Notes</h2>
          <span className="badge badge-primary badge-lg">{notes.length}</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-indigo-500" />
          </div>
        )}

        {!loading && notes.length === 0 && !isRateLimited && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="mb-3 text-5xl">📝</div>
            <p>No notes yet. Create your first one!</p>
          </div>
        )}

        {!loading && notes.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <li
                key={note._id}
                className="group card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-5 transition hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/notes/${note._id}`}
                    className="font-semibold text-lg mb-1 line-clamp-1 flex-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {note.title}
                  </Link>
                  {/* 🔹 أزرار التعديل والحذف */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(note)}
                      aria-label="Edit note"
                      className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(note._id)}
                      disabled={deletingId === note._id}
                      aria-label="Delete note"
                      className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      {deletingId === note._id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {note.content}
                </p>

                <div className="mt-3 text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 🔹 Modal التعديل */}
      {editingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !saving && setEditingNote(null)}
        >
          <form
            onSubmit={handleUpdate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Note</h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                disabled={saving}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <label className="block mb-3">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </span>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, title: e.target.value })
                }
                required
                minLength={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white transition"
              />
            </label>

            <label className="block mb-4">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content
              </span>
              <textarea
                value={editingNote.content}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, content: e.target.value })
                }
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white resize-none transition"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomePage;
