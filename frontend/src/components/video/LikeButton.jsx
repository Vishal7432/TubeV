import { useState } from "react";
import axiosInstance from "../../apis/Axiosinstance.js";

export default function LikeButton({
  videoId,
  initialLiked = false,
  initialCount = 0,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggleLike() {
    setPending(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
      const nextLiked = data.data.isLiked;
      setLiked(nextLiked);
      setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    } catch {
      setError("Could not update like.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={toggleLike}
        disabled={pending}
        aria-pressed={liked}
        className="text-sm text-[#868C99] hover:text-[#2DD4BF] disabled:opacity-50"
      >
        {liked ? "Liked" : "Like"} · {count}
      </button>
      {error && <span className="ml-2 text-xs text-red-400">{error}</span>}
    </span>
  );
}
