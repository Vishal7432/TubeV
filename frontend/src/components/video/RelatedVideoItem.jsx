import { Link } from "react-router-dom";
import { formatDuration, formatViews, timeAgo } from "../../utils/format";

export default function RelatedVideoItem({ video }) {
  const owner = video.ownerDetails;

  return (
    <Link to={`/videos/${video._id}`} className="group flex gap-3">
      <div className="relative w-40 shrink-0 aspect-video rounded-lg bg-[#1D1F26] overflow-hidden">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        {video.duration != null && (
          <span className="absolute bottom-1 right-1 bg-black/75 text-[#F2F3F5] text-[10px] px-1 py-0.5 rounded tabular-nums">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm leading-snug line-clamp-2 group-hover:text-[#2DD4BF] transition-colors">
          {video.title}
        </h3>
        <p className="mt-1 text-xs text-[#868C99] truncate">
          {owner?.username ?? "unknown"}
        </p>
        <p className="text-xs text-[#868C99] tabular-nums">
          {formatViews(video.views ?? 0)} views · {timeAgo(video.createdAt)}
        </p>
      </div>
    </Link>
  );
}
