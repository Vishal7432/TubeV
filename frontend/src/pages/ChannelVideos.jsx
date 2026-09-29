import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoById } from "../apis/Vidoe.api.js";

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVideoById(id)
      .then((data) => !cancelled && setVideo(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        to="/videos"
        className="text-sm text-[#868C99] hover:text-[#F2F3F5]"
      >
        ← Back to videos
      </Link>

      {loading && <p className="text-sm text-[#868C99]">Loading…</p>}

      {error && (
        <p className="text-sm text-[#868C99]">Couldn&apos;t load this video.</p>
      )}

      {video && (
        <>
          <div className="aspect-video bg-[#1D1F26] border border-[#2C2F38] rounded-lg overflow-hidden">
            {video.videoFile ? (
              <video src={video.videoFile} controls className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#868C99] text-sm">
                Player unavailable
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-xl">{video.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-[#868C99]">
              <span className="tabular-nums">{video.views ?? 0} views</span>
              <span>·</span>
              <span>
                {video.createdAt
                  ? new Date(video.createdAt).toLocaleDateString()
                  : ""}
              </span>
              <span className="ml-auto text-[#2DD4BF] tabular-nums">
                {video.likesCount ?? 0} likes
              </span>
            </div>
            <p className="mt-4 text-sm text-[#868C99] leading-relaxed">
              {video.description}
            </p>
          </div>

          {/* Comments: wire up once a getVideoComments endpoint is available. */}
          <div>
            <h2 className="text-sm text-[#868C99] mb-4">Comments</h2>
            <p className="text-sm text-[#868C99]">
              Comment loading not wired up yet.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
