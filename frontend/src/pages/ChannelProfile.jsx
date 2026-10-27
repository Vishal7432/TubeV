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

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString();
}

function formatJoinDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
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
  const joinedDate = formatJoinDate(profile.createdAt);
  const channelVideoCount = totalVideos ?? profile.videosCount ?? 0;
  const aboutStats = [
    {
      label: "Subscribers",
      value: formatNumber(subscribersCount),
      icon: "◉",
      accent: "text-[#2DD4BF] bg-[#2DD4BF]/10",
    },
    {
      label: "Videos",
      value: formatNumber(totalVideos ?? profile.videosCount),
      icon: "▶",
      accent: "text-[#8B9CFF] bg-[#8B9CFF]/10",
    },
    {
      label: "Total views",
      value: formatNumber(profile.totalViews),
      icon: "↗",
      accent: "text-[#F6BD60] bg-[#F6BD60]/10",
    },
    ...(profile.channelsSubscribedToCount != null
      ? [
          {
            label: "Following",
            value: formatNumber(profile.channelsSubscribedToCount),
            icon: "＋",
            accent: "text-[#F28B82] bg-[#F28B82]/10",
          },
        ]
      : []),
  ];

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

        <div className="flex w-full flex-wrap items-center gap-3 pb-1 sm:ml-auto sm:w-auto">
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
        <section
          aria-label={`About ${displayName}`}
          className="mx-auto mt-6 w-full max-w-5xl space-y-5"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#2C2F38] bg-gradient-to-br from-[#1D292A] via-[#191A20] to-[#191A20] p-5 sm:p-8">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#2DD4BF]/10 blur-3xl"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar
                user={profile}
                className="h-20 w-20 shrink-0 text-3xl ring-4 ring-[#F2F3F5]/5 sm:h-24 sm:w-24"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2DD4BF]">
                  Channel overview
                </p>
                <h2 className="mt-2 truncate font-display text-2xl sm:text-3xl">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-[#A2A8B4]">
                  @{profile.username}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#868C99]">
                  {joinedDate
                    ? `Sharing videos with the TubeV community since ${joinedDate}.`
                    : "A TubeV creator sharing videos with the community."}
                </p>
              </div>
              {joinedDate && (
                <span className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-full border border-[#2C2F38] px-3 text-xs text-[#A2A8B4] sm:self-center">
                  <span aria-hidden="true" className="text-[#2DD4BF]">
                    ◷
                  </span>
                  Joined {joinedDate}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aboutStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#2C2F38] bg-[#191A20] p-4 transition-colors hover:border-[#3A3D47] sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#A2A8B4]">{stat.label}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${stat.accent}`}
                  >
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-4 font-display text-3xl tabular-nums tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-[#727987]">
                  {stat.label === "Videos"
                    ? "Published on this channel"
                    : stat.label === "Following"
                      ? "Channels followed"
                      : stat.label === "Total views"
                        ? "Across channel videos"
                        : "People following this channel"}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
            <div className="rounded-2xl border border-[#2C2F38] bg-[#191A20] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#868C99]">
                About this channel
              </p>
              <h3 className="mt-2 font-display text-xl">
                {isOwner ? "Your creator space" : `Get to know ${displayName}`}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#A2A8B4]">
                {channelVideoCount
                  ? `${displayName} has published ${plural(channelVideoCount, "video")} on TubeV. Explore the Videos tab to discover the latest uploads.`
                  : isOwner
                    ? "Your channel is ready. Upload your first video and it will appear here for the community."
                    : `${displayName} hasn't published any videos yet. Check back later for new uploads.`}
              </p>
              {channelVideoCount > 0 && (
                <button
                  type="button"
                  onClick={() => setTab("videos")}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#2DD4BF] transition-colors hover:text-[#54E8D0]"
                >
                  Explore videos <span aria-hidden="true">→</span>
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-[#2C2F38] bg-[#191A20] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#868C99]">
                Channel details
              </p>
              <dl className="mt-4 divide-y divide-[#2C2F38]">
                <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <dt className="text-sm text-[#868C99]">Username</dt>
                  <dd className="truncate text-sm font-medium">
                    @{profile.username}
                  </dd>
                </div>
                {joinedDate && (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-sm text-[#868C99]">Joined</dt>
                    <dd className="text-right text-sm font-medium">
                      {joinedDate}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <dt className="text-sm text-[#868C99]">Channel type</dt>
                  <dd className="rounded-full border border-[#2C2F38] px-2.5 py-1 text-xs text-[#C8CDD6]">
                    Creator
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
