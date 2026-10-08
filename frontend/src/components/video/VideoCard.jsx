import { Link } from "react-router-dom";
import { formatDuration, formatViews, timeAgo } from "../../utils/format";

export default function VideoCard({ video }) {
  // owner is populated as an object only if the backend does a $lookup on users.
  const owner =
    video.owner && typeof video.owner === "object" ? video.owner : null;
  const channelName = owner?.username ?? "unknown";
  const initial = channelName[0]?.toUpperCase() ?? "?";

  return (
    <div className="group">
      <Link to={`/videos/${video._id}`} className="block">
        <div className="aspect-video bg-[#1D1F26] rounded-lg overflow-hidden relative">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          {video.duration != null && (
            <span className="absolute bottom-2 right-2 bg-black/75 text-[#F2F3F5] text-xs px-1.5 py-0.5 rounded tabular-nums">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </Link>

      <div className="flex gap-3 mt-3">
        <Link
          to={owner ? `/channel/${owner.username}` : "#"}
          className="h-9 w-9 shrink-0 rounded-full bg-[#24262F] overflow-hidden flex items-center justify-center text-sm text-[#F2F3F5]"
        >
          {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </Link>

        <div className="min-w-0">
          <Link to={`/videos/${video._id}`}>
            <h3 className="text-sm leading-snug line-clamp-2 group-hover:text-[#2DD4BF] transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link
            to={owner ? `/channel/${owner.username}` : "#"}
            className="block mt-1 text-xs text-[#868C99] hover:text-[#F2F3F5] truncate"
          >
            {channelName}
          </Link>
          <p className="text-xs text-[#868C99] tabular-nums">
            {formatViews(video.views ?? 0)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
