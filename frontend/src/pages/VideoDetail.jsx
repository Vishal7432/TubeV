import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllVideos, getVideoById } from "../apis/Vidoe.api.js";
import { getCurrentUser } from "../apis/Auth.api.js";
import Avatar from "../components/common/Avatar";
import LikeButton from "../components/video/LikeButton";
import SubscribeButton from "../components/video/SubscribeButton";
import CommentSection from "../components/video/CommentSection";
import RelatedVideoItem from "../components/video/RelatedVideoItem";
import { formatViews, timeAgo } from "../utils/format";

// Turns any http(s) links in the description into real links (keeps the Pixabay credit clickable).
function Linkified({ text = "" }) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2DD4BF] hover:underline"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {});
    getAllVideos({ limit: 12 })
      .then((res) => setRelated(res.docs ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    getVideoById(id)
      .then((data) => {
        if (cancelled) return;
        setVideo(data);
        setSubscribersCount(data.ownerDetails?.subscribersCount ?? 0);
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-sm text-[#868C99]">Loading…</p>;

  if (error || !video) {
    return (
      <div className="text-sm text-[#868C99]">
        Couldn&apos;t load this video.{" "}
        <Link to="/" className="text-[#2DD4BF] underline">
          Back to home
        </Link>
      </div>
    );
  }

  const owner = video.ownerDetails;
  const isOwnVideo =
    currentUser && owner && String(currentUser._id) === String(owner._id);
  const upNext = related.filter((v) => v._id !== video._id).slice(0, 8);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {/* Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <video
            key={video._id}
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            className="h-full w-full"
          />
        </div>

        <h1 className="font-display text-xl leading-snug">{video.title}</h1>

        {/* Channel row */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/channel/${owner?.username}`}
            className="flex items-center gap-3 min-w-0"
          >
            <Avatar user={owner} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {owner?.fullName ?? owner?.username ?? "Unknown channel"}
              </p>
              <p className="text-xs text-[#868C99] tabular-nums">
                {subscribersCount}{" "}
                {subscribersCount === 1 ? "subscriber" : "subscribers"}
              </p>
            </div>
          </Link>

          {currentUser && !isOwnVideo && owner && (
            <SubscribeButton
              key={owner._id}
              channelId={owner._id}
              initialSubscribed={owner.isSubscribed ?? false}
              onToggle={(subscribed) =>
                setSubscribersCount((n) => n + (subscribed ? 1 : -1))
              }
            />
          )}

          <div className="ml-auto">
            <LikeButton
              key={video._id}
              videoId={video._id}
              initialLiked={video.isLiked ?? false}
              initialCount={video.likesCount ?? 0}
            />
          </div>
        </div>

        {/* Description box */}
        <div className="bg-[#1D1F26] rounded-xl p-4">
          <p className="text-sm font-medium tabular-nums">
            {formatViews(video.views ?? 0)} views · {timeAgo(video.createdAt)}
          </p>
          <p className="mt-2 text-sm text-[#868C99] leading-relaxed whitespace-pre-line break-words">
            <Linkified text={video.description} />
          </p>
        </div>

        <CommentSection
          key={video._id}
          videoId={video._id}
          currentUser={currentUser}
        />
      </div>

      {/* Up next */}
      <aside className="space-y-4">
        <h2 className="text-sm text-[#868C99]">Up next</h2>
        {upNext.map((v) => (
          <RelatedVideoItem key={v._id} video={v} />
        ))}
      </aside>
    </div>
  );
}
