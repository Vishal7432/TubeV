import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getChannelProfile } from "../apis/Channel.api.js";
import { getAllVideos } from "../apis/Vidoe.api.js";
import { getCurrentUser } from "../apis/Auth.api.js";
import Avatar from "../components/common/Avatar";
import FilterChips from "../components/video/FilterChips";
import SubscribeButton from "../components/video/SubscribeButton";
import VideoCard from "../components/video/VideoCard";

const FILTERS = [
  { label: "Latest", sortBy: "createdAt", sortType: "desc" },
  { label: "Popular", sortBy: "views", sortType: "desc" },
  { label: "Oldest", sortBy: "createdAt", sortType: "asc" },
];
const PAGE_SIZE = 12;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#2C2F38] pb-3">
      <dt className="text-[#868C99]">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default function ChannelProfile() {
  const { username } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [tab, setTab] = useState("videos");
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalVideos, setTotalVideos] = useState(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  // Load the channel whenever the username in the URL changes.
  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);
    setProfile(null);
    setTab("videos");
    setActiveFilter(FILTERS[0]);
    setVideos([]);
    setTotalVideos(null);
    window.scrollTo(0, 0);

    getChannelProfile(username)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setSubscribersCount(data.subscribersCount ?? 0);
      })
      .catch((err) => !cancelled && setProfileError(err))
      .finally(() => !cancelled && setProfileLoading(false));

    return () => {
      cancelled = true;
    };
  }, [username]);

  // Load the first page of this channel's videos (and again when the sort changes).
  useEffect(() => {
    if (!profile?._id) return;
    let cancelled = false;
    setVideosLoading(true);

    getAllVideos({
      userId: profile._id,
      sortBy: activeFilter.sortBy,
      sortType: activeFilter.sortType,
      page: 1,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setVideos(res.docs ?? []);
        setHasNextPage(res.hasNextPage ?? false);
        setTotalVideos(res.totalDocs ?? 0);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => !cancelled && setVideosLoading(false));

    return () => {
      cancelled = true;
    };
  }, [profile?._id, activeFilter]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getAllVideos({
        userId: profile._id,
        sortBy: activeFilter.sortBy,
        sortType: activeFilter.sortType,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setVideos((prev) => [...prev, ...(res.docs ?? [])]);
      setHasNextPage(res.hasNextPage ?? false);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  if (profileLoading)
    return <p className="text-sm text-[#868C99]">Loading channel…</p>;

  if (profileError || !profile) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-xl">This channel doesn&apos;t exist</p>
        <p className="text-sm text-[#868C99] mt-2">
          We couldn&apos;t find @{username}. Check the link and try again.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 text-sm text-[#2DD4BF] hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const isOwner =
    currentUser &&
    (String(currentUser._id) === String(profile._id) ||
      currentUser.username === profile.username);
  const displayName = profile.fullName ?? profile.username;

  return (
    <div>
      {/* Cover */}
      <div
        className="h-32 sm:h-48 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(120deg,#1D3B3A,#24262F 60%,#14151A)",
        }}
      >
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Identity row */}
      <div className="-mt-10 sm:-mt-12 px-2 sm:px-4 flex flex-wrap items-end gap-4">
        <Avatar
          user={profile}
          className="h-20 w-20 sm:h-24 sm:w-24 text-3xl ring-4 ring-[#14151A]"
        />
        <div className="min-w-0 pb-1">
          <h1 className="font-display text-2xl truncate">{displayName}</h1>
          <p className="text-sm text-[#868C99] tabular-nums">
            @{profile.username} · {plural(subscribersCount, "subscriber")}
            {totalVideos !== null && ` · ${plural(totalVideos, "video")}`}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3 pb-1">
          {isOwner ? (
            <>
              <Link
                to="/upload"
                className="px-4 py-2 rounded-full text-sm font-medium bg-[#2DD4BF] text-[#0B0C0F] hover:bg-[#2DD4BF]/90 transition-colors"
              >
                Upload
              </Link>
              <Link
                to="/studio"
                className="px-4 py-2 rounded-full text-sm border border-[#2C2F38] hover:border-[#F2F3F5]/30 transition-colors"
              >
                Studio
              </Link>
            </>
          ) : (
            currentUser && (
              <SubscribeButton
                key={profile._id}
                channelId={profile._id}
                initialSubscribed={profile.isSubscribed ?? false}
                onToggle={(subscribed) =>
                  setSubscribersCount((n) => n + (subscribed ? 1 : -1))
                }
              />
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#2C2F38] mt-6">
        {[
          { id: "videos", label: "Videos" },
          { id: "about", label: "About" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 -mb-px text-sm border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#2DD4BF] text-[#F2F3F5]"
                : "border-transparent text-[#868C99] hover:text-[#F2F3F5]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "videos" ? (
        <div className="mt-6 space-y-6">
          {totalVideos !== 0 && (
            <FilterChips
              filters={FILTERS}
              active={activeFilter}
              onChange={setActiveFilter}
            />
          )}

          {videosLoading && videos.length === 0 && (
            <p className="text-sm text-[#868C99]">Loading videos…</p>
          )}

          {!videosLoading && totalVideos === 0 && (
            <div className="py-16 text-center">
              {isOwner ? (
                <>
                  <p className="font-display text-lg">
                    You haven&apos;t uploaded anything yet
                  </p>
                  <p className="text-sm text-[#868C99] mt-2">
                    Your first video will show up here.
                  </p>
                  <Link
                    to="/upload"
                    className="inline-block mt-5 px-5 py-2 rounded-full text-sm font-medium bg-[#2DD4BF] text-[#0B0C0F] hover:bg-[#2DD4BF]/90 transition-colors"
                  >
                    Upload your first video
                  </Link>
                </>
              ) : (
                <p className="text-sm text-[#868C99]">
                  {displayName} hasn&apos;t uploaded any videos yet.
                </p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} hideChannel />
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-5 py-2 rounded-full text-sm border border-[#2C2F38] hover:border-[#F2F3F5]/30 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Show more videos"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <dl className="mt-6 grid gap-4 max-w-md text-sm">
          <Row label="Username" value={`@${profile.username}`} />
          <Row label="Subscribers" value={subscribersCount} />
          {profile.totalViews != null && (
            <Row
              label="Total views"
              value={profile.totalViews.toLocaleString()}
            />
          )}
          <Row
            label="Videos"
            value={totalVideos ?? profile.videosCount ?? "—"}
          />
          {profile.channelsSubscribedToCount != null && (
            <Row
              label="Subscribed to"
              value={profile.channelsSubscribedToCount}
            />
          )}
          {profile.createdAt && (
            <Row
              label="Joined"
              value={new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
        </dl>
      )}
    </div>
  );
}
