import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../apis/Vidoe.api.js";
import FilterChips from "../components/video/FilterChips";
import VideoCard from "../components/video/VideoCard";

const FILTERS = [
  { label: "All", sortBy: "createdAt", sortType: "desc" },
  { label: "Most viewed", sortBy: "views", sortType: "desc" },
  { label: "Most liked", sortBy: "likesCount", sortType: "desc" },
  { label: "Oldest", sortBy: "createdAt", sortType: "asc" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  // Reload from page 1 whenever the search term or filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllVideos({
      query,
      sortBy: activeFilter.sortBy,
      sortType: activeFilter.sortType,
      page: 1,
      limit: 12,
    })
      .then((res) => {
        if (cancelled) return;
        setVideos(res.docs ?? []);
        setHasNextPage(res.hasNextPage ?? false);
        setPage(1);
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query, activeFilter]);

  // Infinite scroll: fetch the next page when the sentinel enters the viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const nextPage = page + 1;
        getAllVideos({
          query,
          sortBy: activeFilter.sortBy,
          sortType: activeFilter.sortType,
          page: nextPage,
          limit: 12,
        }).then((res) => {
          setVideos((prev) => [...prev, ...(res.docs ?? [])]);
          setHasNextPage(res.hasNextPage ?? false);
          setPage(nextPage);
        });
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasNextPage, loading, query, activeFilter]);

  return (
    <div className="space-y-6">
      <FilterChips
        filters={FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {query && (
        <p className="text-sm text-[#868C99]">
          Results for &ldquo;<span className="text-[#F2F3F5]">{query}</span>
          &rdquo;
        </p>
      )}

      {error && (
        <p className="text-sm text-[#868C99]">
          Couldn&apos;t load videos.{" "}
          <button
            onClick={() => setActiveFilter({ ...activeFilter })}
            className="text-[#2DD4BF] underline"
          >
            Retry
          </button>
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {!loading && videos.length === 0 && !error && (
        <p className="text-sm text-[#868C99] py-16 text-center">
          {query
            ? `No videos found for “${query}”.`
            : "No videos yet. Be the first to upload one."}
        </p>
      )}

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="h-10 flex items-center justify-center text-xs text-[#868C99]"
        >
          Loading more…
        </div>
      )}
    </div>
  );
}
