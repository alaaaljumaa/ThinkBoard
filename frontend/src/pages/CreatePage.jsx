import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import RateLimitBanner from "../components/RateLimiter";

const API_URL =import.meta.env.MODE==="development"?"http://localhost:5001/api/notes":"/api/notes" ;

const CreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [completed, setCompleted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(60);

  const canSubmit = title.trim().length >= 3 && content.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    const toastId = toast.loading("Creating note...");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          completed,
        }),
      });

      // 429 → Rate limit
      if (res.status === 429) {
        const seconds = Number(res.headers.get("Retry-After")) || 60;
        setRetryAfter(seconds);
        setIsRateLimited(true);
        toast.error(`Slow down! Try again in ${seconds}s.`, { id: toastId });
        return;
      }

      // 400 → Validation errors من Mongoose
      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Validation failed", { id: toastId });
        return;
      }

      if (!res.ok) throw new Error(`Failed to create note (${res.status})`);

      toast.success("Note created ✅", { id: toastId });
      navigate("/"); // رجوع للرئيسية
    } catch (err) {
      const message =
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Is the backend running?"
          : err.message;
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setIsRateLimited(false);
    toast("You can try again now.", { icon: "🔄" });
  };
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

      <main className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            aria-label="Back to home"
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Note</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Capture your thoughts quickly.
            </p>
          </div>
        </div>

        {/* Card / Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Title */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy groceries"
              required
              minLength={3}
              maxLength={100}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition
                         placeholder:text-gray-400
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         disabled:opacity-60
                         dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
            />
            <span className="mt-1 block text-xs text-gray-400">
              {title.length}/100 • minimum 3 characters
            </span>
          </label>

          {/* Content */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content <span className="text-red-500">*</span>
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              required
              rows={6}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition
                         placeholder:text-gray-400
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         disabled:opacity-60
                         dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
            />
            <span className="mt-1 block text-xs text-gray-400">
              {content.length} characters
            </span>
          </label>

          {/* Completed toggle */}
          <label className="mb-6 flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-950"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mark as completed
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Link
              to="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition
                         hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Create Note
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePage;
