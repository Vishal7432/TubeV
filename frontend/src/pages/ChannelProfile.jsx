import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createChannelPost,
  getChannelPosts,
  getChannelProfile,
} from "../apis/Channel.api.js";
import { getCurrentUser } from "../apis/Auth.api.js";
import { getAllVideos } from "../apis/Vidoe.api.js";
import VideoCard from "../components/video/VideoCard.jsx";

function formatCount(count = 0) {
  return new Intl.NumberFormat().format(count);
}

export default function ChannelProfile() {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isOwnChannel, setIsOwnChannel] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function loadChannel() {
      try {
        const [profile, currentUser] = await Promise.all([
          getChannelProfile(username),
          getCurrentUser(),
        ]);
        if (cancelled) return;
        setChannel(profile);
        setIsOwnChannel(currentUser?._id === profile._id);
        setContentLoading(true);

        try {
          const [videoResult, channelPosts] = await Promise.all([
            getAllVideos({ userId: profile._id, limit: 100 }),
            getChannelPosts(profile._id),
          ]);
          if (cancelled) return;

          setVideos(
            Array.isArray(videoResult)
              ? videoResult
              : (videoResult?.docs ?? []),
          );
          setPosts(Array.isArray(channelPosts) ? channelPosts : []);
        } catch {
          if (!cancelled) {
            setContentError("Could not load this channel's uploads.");
          }
        }
      } catch {
        if (!cancelled) setError("Could not load this channel.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setContentLoading(false);
        }
      }
    }

    loadChannel();

    return () => {
      cancelled = true;
    };
  }, [username]);

  async function handleCreatePost(event) {
    event.preventDefault();
    if (posting || (!postContent.trim() && !postImage)) return;

    const form = event.currentTarget;
    setPosting(true);
    setPostError("");
    try {
      const post = await createChannelPost({
        content: postContent,
        image: postImage,
      });
      setPosts((current) => [post, ...current]);
      setPostContent("");
      setPostImage(null);
      form.reset();
    } catch {
      setPostError("Could not publish your post. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#868C99]">Loading channel…</p>;
  }

  if (error || !channel) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#868C99]">
          {error || "This channel could not be found."}
        </p>
        <Link to="/" className="text-sm text-[#2DD4BF] underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {channel.coverImage && (
        <img
          src={channel.coverImage}
          alt=""
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      <div className="flex items-center gap-4">
        {channel.avatar && (
          <img
            src={channel.avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="font-display text-2xl">
            {channel.fullName || channel.username}
          </h1>
          <p className="text-sm text-[#868C99]">@{channel.username}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[#2C2F38] py-4 text-sm text-[#868C99]">
        <span>{formatCount(channel.subscribersCount)} subscribers</span>
        <span>
          {formatCount(channel.channelsSubscribedToCount)} subscriptions
        </span>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-display text-xl">Videos</h2>
          {contentLoading ? (
            <p className="text-sm text-[#868C99]">Loading videos…</p>
          ) : videos.length ? (
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#868C99]">No videos uploaded yet.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl">Posts</h2>
          {isOwnChannel && (
            <form
              onSubmit={handleCreatePost}
              className="space-y-3 rounded-lg border border-[#2C2F38] bg-[#1D1F26] p-4"
            >
              <textarea
                value={postContent}
                onChange={(event) => setPostContent(event.target.value)}
                maxLength={2000}
                placeholder="Share a post with your channel…"
                aria-label="Post text"
                className="min-h-24 w-full resize-y rounded-md border border-[#2C2F38] bg-[#14151A] p-3 text-sm text-[#F2F3F5] placeholder:text-[#868C99] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="cursor-pointer text-sm text-[#2DD4BF]">
                  Add image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="sr-only"
                    onChange={(event) =>
                      setPostImage(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <span className="text-xs text-[#868C99]">
                  {postImage?.name ?? "Text or image required"}
                </span>
                <button
                  type="submit"
                  disabled={posting || (!postContent.trim() && !postImage)}
                  className="rounded-md bg-[#2DD4BF] px-4 py-2 text-sm font-medium text-[#14151A] disabled:opacity-50"
                >
                  {posting ? "Posting…" : "Post"}
                </button>
              </div>
              {postError && (
                <p role="alert" className="text-sm text-red-400">
                  {postError}
                </p>
              )}
            </form>
          )}
          {contentLoading ? (
            <p className="text-sm text-[#868C99]">Loading posts…</p>
          ) : posts.length ? (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post._id}
                  className="rounded-lg border border-[#2C2F38] bg-[#1D1F26] p-4"
                >
                  {post.content && (
                    <p className="whitespace-pre-wrap text-sm">
                      {post.content}
                    </p>
                  )}
                  {post.image && (
                    <img
                      src={post.image}
                      alt={`Post by @${channel.username}`}
                      className="mt-3 max-h-[32rem] w-full rounded-md object-contain"
                    />
                  )}
                  <time
                    className="mt-3 block text-xs text-[#868C99]"
                    dateTime={post.createdAt}
                  >
                    {new Date(post.createdAt).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#868C99]">No posts yet.</p>
          )}
        </section>
        {contentError && (
          <p role="alert" className="text-sm text-red-400">
            {contentError}
          </p>
        )}
      </div>
    </section>
  );
}
