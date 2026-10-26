import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAllVideos,
  getVideoById,
  recordVideoView,
} from "../apis/Vidoe.api.js";
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
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedHasNextPage, setRelatedHasNextPage] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const relatedAsideRef = useRef(null);
  const relatedSentinelRef = useRef(null);
  const relatedLoadingRef = useRef(false);
  const viewRecordedRef = useRef(false);
  const [viewError, setViewError] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {});

    let cancelled = false;
    setRelatedLoading(true);
    getAllVideos({ page: 1, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        setRelated(res.docs ?? []);
        setRelatedHasNextPage(res.hasNextPage ?? false);
        setRelatedPage(1);
        setRelatedError(false);
      })
      .catch(() => !cancelled && setRelatedError(true))
      .finally(() => !cancelled && setRelatedLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMoreRelated() {
    if (relatedLoadingRef.current || !relatedHasNextPage) return;

    relatedLoadingRef.current = true;
    setRelatedLoading(true);
    setRelatedError(false);
    const nextPage = relatedPage + 1;

    try {
      const res = await getAllVideos({ page: nextPage, limit: 12 });
      setRelated((videos) => [...videos, ...(res.docs ?? [])]);
      setRelatedHasNextPage(res.hasNextPage ?? false);
      setRelatedPage(nextPage);
    } catch {
      setRelatedError(true);
    } finally {
      relatedLoadingRef.current = false;
      setRelatedLoading(false);
    }
  }

  async function retryRelated() {
    if (related.length > 0) {
      loadMoreRelated();
      return;
    }
    if (relatedLoadingRef.current) return;

    relatedLoadingRef.current = true;
    setRelatedLoading(true);
    setRelatedError(false);
    try {
      const res = await getAllVideos({ page: 1, limit: 12 });
      setRelated(res.docs ?? []);
      setRelatedHasNextPage(res.hasNextPage ?? false);
      setRelatedPage(1);
    } catch {
      setRelatedError(true);
    } finally {
      relatedLoadingRef.current = false;
      setRelatedLoading(false);
    }
  }

  useEffect(() => {
    const root = relatedAsideRef.current;
    const sentinel = relatedSentinelRef.current;
    if (
      !root ||
      !sentinel ||
      !relatedHasNextPage ||
      relatedLoading ||
      relatedError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreRelated();
      },
      {
        root: window.matchMedia("(min-width: 1024px)").matches ? root : null,
        rootMargin: "200px",
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [relatedHasNextPage, relatedLoading, relatedError, relatedPage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    viewRecordedRef.current = false;
    setViewError(null);
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

  async function handleVideoPlay() {
    if (viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    setViewError(null);

    try {
      await recordVideoView(id);
    } catch (err) {
      viewRecordedRef.current = false;
      setViewError(
        err.response?.data?.message ?? "Could not record this video view.",
      );
    }
  }

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
  const upNext = related.filter((v) => v._id !== video._id);

  return (
    <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {/* Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <video
            key={video._id}
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            onPlay={handleVideoPlay}
            className="h-full w-full"
          />
        </div>
        {viewError && (
          <p role="status" className="text-xs text-[#FF4757]">
            {viewError}
          </p>
        )}

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
      <aside
        ref={relatedAsideRef}
        className="scrollbar-hidden space-y-4 lg:sticky lg:top-0 lg:h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain"
      >
        <h2 className="text-sm text-[#868C99]">Up next</h2>
        {upNext.map((v) => (
          <RelatedVideoItem key={v._id} video={v} />
        ))}
        {relatedError && (
          <div className="text-xs text-[#868C99]">
            Couldn&apos;t load more videos.{" "}
            <button onClick={retryRelated} className="text-[#2DD4BF] underline">
              Retry
            </button>
          </div>
        )}
        {relatedLoading && (
          <p className="text-xs text-[#868C99]">Loading suggestions…</p>
        )}
        <div ref={relatedSentinelRef} aria-hidden="true" className="h-px" />
      </aside>
    </div>
  );
}
