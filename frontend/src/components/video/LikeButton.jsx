import { useState } from "react";
import { toggleVideoLike } from "../../apis/like.api.js";

export default function LikeButton({
  videoId,
  initialLiked = false,
  initialCount = 0,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    // Optimistic update so the UI feels instant; rolled back on failure.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      await toggleVideoLike(videoId);
    } catch {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this video" : "Like this video"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
        liked
          ? "bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#2DD4BF]"
          : "border-[#2C2F38] text-[#868C99] hover:text-[#F2F3F5] hover:border-[#F2F3F5]/30"
      }`}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
