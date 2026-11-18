import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Save, X, Calendar, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import RateLimitBanner from "../components/RateLimiter";

const API_URL =import.meta.env.MODE==="development"?"http://localhost:5001/api/notes":"/api/notes" ;

const NotesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // حالة التعديل
  const [draft, setDraft] = useState({ title: "", content: "", completed: false });

  // Rate limit
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(60);

  const handleRateLimit = (res) => {
    const seconds = Number(res.headers.get("Retry-After")) || 60;
    setRetryAfter(seconds);
    setIsRateLimited(true);
    toast.error(`Slow down! Try again in ${seconds}s.`, { id: "rate-limit" });
  };

  // ===== جلب الملاحظة =====
  const fetchNote = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`);

      if (res.status === 429) return handleRateLimit(res);
      if (res.status === 404) {
        toast.error("Note not found");
        navigate("/");
        return;
      }
      if (!res.ok) throw new Error(`Failed to load note (${res.status})`);

      const data = await res.json();
      setNote(data.note);
      setDraft({
        title: data.note.title,
        content: data.note.content,
        completed: !!data.note.completed,
      });
    } catch (err) {
      const message =
        err.message === "Failed to fetch"
          ? "Cannot reach the server."
          : err.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  // ===== حفظ التعديل =====
  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    const tid = toast.loading("Saving...");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          content: draft.content.trim(),
          completed: draft.completed,
        }),
      });

      if (res.status === 429) {
        toast.error("Rate limit", { id: tid });
        return handleRateLimit(res);
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      setNote(data.note);
      setIsEditing(false);
      toast.success("Note updated ✏️", { id: tid });
    } catch {
      toast.error("Failed to update note", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  // ===== حذف =====
  const handleDelete = async () => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;

    setDeleting(true);
    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (res.status === 429) {
        toast.error("Rate limit", { id: tid });
        return handleRateLimit(res);
      }
      if (!res.ok) throw new Error();

      toast.success("Note deleted ✅", { id: tid });
      navigate("/");
    } catch {
      toast.error("Failed to delete note", { id: tid });
    } finally {
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({
      title: note.title,
      content: note.content,
      completed: !!note.completed,
    });
  };

  // ===== Render =====
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Navbar />

      {isRateLimited && (
        <RateLimitBanner
          resetSeconds={retryAfter}
          onRetry={fetchNote}
          onDismiss={() => setIsRateLimited(false)}
        />
      )}

      <main className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold flex-1">Note Details</h1>

          {!isEditing && note && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Edit"
                className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete"
                className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition disabled:opacity-50"
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-indigo-500" />
          </div>
        )}

        {/* Content */}
        {!loading && note && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {!isEditing ? (
              <>
                {/* عرض */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold break-words">{note.title}</h2>
                  {note.completed && (
                    <span className="badge badge-success gap-1 shrink-0">
                      <CheckCircle2 size={12} /> Done
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {note.content}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    Created {new Date(note.createdAt).toLocaleString()}
                  </span>
                  {note.updatedAt && note.updatedAt !== note.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <Pencil size={12} />
                      Updated {new Date(note.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* تعديل */}
                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white disabled:opacity-60"
                  />
                </label>

                <label className="mb-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content
                  </span>
                  <textarea
                    value={draft.content}
                    onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                    rows={8}
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white disabled:opacity-60"
                  />
                </label>

                <label className="mb-6 flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draft.completed}
                    onChange={(e) => setDraft({ ...draft, completed: e.target.checked })}
                    disabled={saving}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-950"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mark as completed
                  </span>
                </label>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="loading loading-spinner loading-xs" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotesDetails;