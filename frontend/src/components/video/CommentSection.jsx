import { useEffect, useState } from "react";
import axiosInstance from "../../apis/Axiosinstance.js";

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get(`/comments/${videoId}`)
      .then(({ data }) => {
        if (!cancelled) setComments(data.data.docs ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  async function submitComment(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text || pending) return;

    setPending(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(`/comments/${videoId}`, {
        content: text,
      });
      setComments((current) => [data.data, ...current]);
      setContent("");
    } catch {
      setError("Could not post comment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm text-[#868C99]">Comments</h2>
      <form onSubmit={submitComment} className="flex gap-3">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={1000}
          placeholder="Add a comment"
          aria-label="Add a comment"
          className="flex-1 rounded-md border border-[#2C2F38] bg-[#1D1F26] px-3 py-2 text-sm text-[#F2F3F5] placeholder:text-[#868C99] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        />
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="rounded-md bg-[#2DD4BF] px-4 py-2 text-sm text-[#14151A] disabled:opacity-50"
        >
          Comment
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-[#868C99]">Loading comments…</p>
      ) : comments.length ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment._id}
              className="border-b border-[#2C2F38] pb-3 text-sm"
            >
              <p className="text-xs text-[#868C99]">
                {comment.ownerDetails?.fullName ??
                  comment.ownerDetails?.username ??
                  "User"}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        !error && (
          <p className="text-sm text-[#868C99]">No comments yet.</p>
        )
      )}
    </section>
  );
}
