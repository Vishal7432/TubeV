import { useEffect, useState } from "react";
import { getVideoComments, addComment } from "../../apis/comment.api.js";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/format";

export default function CommentSection({ videoId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVideoComments(videoId, 1)
      .then((res) => {
        if (cancelled) return;
        setComments(res.docs ?? []);
        setTotalDocs(res.totalDocs ?? 0);
        setHasNextPage(res.hasNextPage ?? false);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  async function loadMore() {
    const nextPage = page + 1;
    const res = await getVideoComments(videoId, nextPage);
    // A comment posted in this session shifts the pages, so skip duplicates.
    setComments((prev) => {
      const seen = new Set(prev.map((c) => c._id));
      return [...prev, ...(res.docs ?? []).filter((c) => !seen.has(c._id))];
    });
    setHasNextPage(res.hasNextPage ?? false);
    setPage(nextPage);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || posting) return;

    setPosting(true);
    setError(null);
    try {
      const created = await addComment(videoId, content);
      // Falls back to the signed-in user if the API didn't include the author.
      const withOwner = {
        ...created,
        ownerDetails: created.ownerDetails ?? currentUser,
      };
      setComments((prev) => [withOwner, ...prev]);
      setTotalDocs((n) => n + 1);
      setText("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't post your comment. Try again.",
      );
    } finally {
      setPosting(false);
    }
  }

  return (
    <section>
      <h2 className="text-base font-medium mb-5 tabular-nums">
        {totalDocs} {totalDocs === 1 ? "comment" : "comments"}
      </h2>

      <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-8">
        <Avatar user={currentUser} />
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            className="w-full bg-transparent border-b border-[#2C2F38] py-2 text-sm text-[#F2F3F5]
                       placeholder:text-[#868C99] focus:outline-none focus:border-[#2DD4BF]"
          />
          {error && <p className="text-xs text-[#FF4757] mt-2">{error}</p>}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="px-4 py-1.5 text-sm rounded-full bg-[#2DD4BF] text-[#0B0C0F] font-medium
                         hover:bg-[#2DD4BF]/90 transition-colors disabled:opacity-40"
            >
              {posting ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-[#868C99]">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#868C99]">
          No comments yet. Be the first to say something.
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((c) => {
            const author = c.ownerDetails;
            return (
              <li key={c._id} className="flex gap-3">
                <Avatar user={author} />
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {author?.fullName ?? author?.username ?? "User"}
                    </span>{" "}
                    <span className="text-xs text-[#868C99]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-[#F2F3F5]/85 mt-1 break-words">
                    {c.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasNextPage && (
        <button
          onClick={loadMore}
          className="mt-6 text-sm text-[#2DD4BF] hover:underline"
        >
          Show more comments
        </button>
      )}
    </section>
  );
}
