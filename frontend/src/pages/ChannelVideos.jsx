import { useEffect, useRef, useState } from "react";
import { getAllVideos } from "../apis/Vidoe.api.js";
import SearchBar from "../components/video/SearchBar";
import FilterChips from "../components/video/FilterChips";
import VideoCard from "../components/video/VideoCard";

const FILTERS = [
  { label: "Newest", sortBy: "createdAt", sortType: "desc" },
  { label: "Most viewed", sortBy: "views", sortType: "desc" },
  { label: "Most liked", sortBy: "likesCount", sortType: "desc" },
];

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ChannelVideos() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebouncedValue(query);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllVideos({
      query: debouncedQuery,
      sortBy: activeFilter.sortBy,
      sortType: activeFilter.sortType,
      page: 1,
    })
      .then((res) => {
        if (cancelled) return;
        setVideos(res.docs ?? []);
        setHasNextPage(res.hasNextPage ?? false);
        setTotalDocs(res.totalDocs ?? 0);
        setPage(1);
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeFilter]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          getAllVideos({
            query: debouncedQuery,
            sortBy: activeFilter.sortBy,
            sortType: activeFilter.sortType,
            page: nextPage,
          }).then((res) => {
            setVideos((prev) => [...prev, ...(res.docs ?? [])]);
            setHasNextPage(res.hasNextPage ?? false);
            setPage(nextPage);
          });
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasNextPage, loading, debouncedQuery, activeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Videos</h1>
        <p className="text-sm text-[#868C99] mt-1">{totalDocs} results</p>
      </div>

      <SearchBar value={query} onChange={setQuery} />
      <FilterChips
        filters={FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
      />

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {!loading && videos.length === 0 && !error && (
        <p className="text-sm text-[#868C99] py-12 text-center">
          No videos match &ldquo;{query}&rdquo;.
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
