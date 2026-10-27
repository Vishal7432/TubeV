import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../apis/Vidoe.api.js";

const MAX_VIDEO_MB = 100; // matches the multer limit on the backend

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(videoFile);
    setVideoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [videoFile]);

  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(thumbnail);
    setThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnail]);

  function handleVideoChange(file) {
    if (file && !VIDEO_TYPES.has(file.type)) {
      setError("Choose an MP4, WebM, MOV, or MKV video file.");
      setVideoFile(null);
      return;
    }
    if (file && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be smaller than ${MAX_VIDEO_MB} MB.`);
      setVideoFile(null);
      return;
    }
    setError(null);
    setVideoFile(file);
  }

  function handleThumbnailChange(file) {
    if (file && !file.type.startsWith("image/")) {
      setError("Choose an image file for the thumbnail.");
      setThumbnail(null);
      return;
    }
    setError(null);
    setThumbnail(file);
  }

  function handleDrop(e, type) {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;

    if (type === "video") handleVideoChange(file);
    else handleThumbnailChange(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!videoFile || !thumbnail) {
      setError("Please choose both a video and a thumbnail.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);

    setUploading(true);
    setProgress(0);
    try {
      const video = await publishVideo(formData, setProgress);
      navigate(video?._id ? `/videos/${video._id}` : "/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2DD4BF]">
            Creator studio
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            Upload a video
          </h1>
          <p className="mt-2 text-sm text-[#868C99]">
            Share your next story with the TubeV community.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#868C99]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2DD4BF]/10 font-semibold text-[#2DD4BF]">
            1
          </span>
          Video details
          <span className="mx-1 h-px w-6 bg-[#2C2F38]" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2C2F38]">
            2
          </span>
          Publish
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]"
      >
        <section className="space-y-6 rounded-2xl border border-[#2C2F38] bg-[#191A20] p-4 sm:p-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2DD4BF]/10 text-lg text-[#2DD4BF]">
                ↑
              </span>
              <div>
                <h2 className="font-display text-lg">Video file</h2>
                <p className="text-xs text-[#868C99]">
                  MP4, WebM, MOV or MKV · up to {MAX_VIDEO_MB} MB
                </p>
              </div>
            </div>
            <label
              htmlFor="videoFile"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging("video");
              }}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => handleDrop(e, "video")}
              className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
                dragging === "video"
                  ? "border-[#2DD4BF] bg-[#2DD4BF]/10"
                  : "border-[#3A3D47] bg-[#14151A] hover:border-[#2DD4BF]/60 hover:bg-[#1D1F26]"
              }`}
            >
              <input
                id="videoFile"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                disabled={uploading}
                onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#24262F] text-xl text-[#2DD4BF]">
                {videoFile ? "✓" : "↑"}
              </span>
              <span className="text-sm font-medium text-[#F2F3F5]">
                {videoFile ? "Video ready to upload" : "Drop your video here"}
              </span>
              <span className="mt-1 text-xs text-[#868C99]">
                or <span className="text-[#2DD4BF]">browse files</span>
              </span>
              {videoFile && (
                <span className="mt-3 max-w-full truncate rounded-full bg-[#24262F] px-3 py-1 text-xs text-[#C8CDD6]">
                  {videoFile.name} · {formatFileSize(videoFile.size)}
                </span>
              )}
            </label>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2DD4BF]/10 text-lg text-[#2DD4BF]">
                ▧
              </span>
              <div>
                <h2 className="font-display text-lg">Thumbnail</h2>
                <p className="text-xs text-[#868C99]">
                  Choose an image that makes your video stand out.
                </p>
              </div>
            </div>
            <label
              htmlFor="thumbnail"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging("thumbnail");
              }}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => handleDrop(e, "thumbnail")}
              className={`flex min-h-32 cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition-colors ${
                dragging === "thumbnail"
                  ? "border-[#2DD4BF] bg-[#2DD4BF]/10"
                  : "border-[#3A3D47] bg-[#14151A] hover:border-[#2DD4BF]/60 hover:bg-[#1D1F26]"
              }`}
            >
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) =>
                  handleThumbnailChange(e.target.files?.[0] ?? null)
                }
                className="sr-only"
              />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Selected video thumbnail preview"
                  className="h-20 w-32 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-[#24262F] text-2xl text-[#868C99]">
                  ▧
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#F2F3F5]">
                  {thumbnail?.name ?? "Add a custom thumbnail"}
                </span>
                <span className="mt-1 block text-xs text-[#868C99]">
                  {thumbnail
                    ? `${formatFileSize(thumbnail.size)} · Click to replace`
                    : "Drop an image or browse · JPG, PNG, WebP"}
                </span>
              </span>
            </label>
          </div>

          <div className="space-y-4 border-t border-[#2C2F38] pt-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-[#E6E8ED]"
                >
                  Video title <span className="text-[#2DD4BF]">*</span>
                </label>
                <span className="text-xs tabular-nums text-[#727987]">
                  {title.length}/100
                </span>
              </div>
              <input
                id="title"
                type="text"
                maxLength={100}
                required
                disabled={uploading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your video a clear, catchy title"
                className="w-full rounded-xl border border-[#343741] bg-[#14151A] px-4 py-3 text-sm text-[#F2F3F5] placeholder:text-[#727987] transition-colors focus:border-[#2DD4BF] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/15 disabled:opacity-60"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-[#E6E8ED]"
                >
                  Description <span className="text-[#2DD4BF]">*</span>
                </label>
                <span className="text-xs text-[#727987]">
                  Tell viewers more
                </span>
              </div>
              <textarea
                id="description"
                required
                rows={5}
                disabled={uploading}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should viewers know about this video?"
                className="w-full resize-y rounded-xl border border-[#343741] bg-[#14151A] px-4 py-3 text-sm leading-relaxed text-[#F2F3F5] placeholder:text-[#727987] transition-colors focus:border-[#2DD4BF] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/15 disabled:opacity-60"
              />
            </div>
          </div>

          {uploading && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-[#2C2F38] bg-[#14151A] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#C8CDD6]">
                  {progress < 100
                    ? "Uploading your video…"
                    : "Processing video…"}
                </span>
                <span className="tabular-nums text-[#2DD4BF]">{progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Video upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="h-2 overflow-hidden rounded-full bg-[#24262F]"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#54E8D0] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-[#FF4757]/30 bg-[#FF4757]/10 px-4 py-3 text-sm text-[#FF7A84]"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[#2C2F38] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#727987]">
              Your video will be published to your channel.
            </p>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex min-h-11 items-center cursor-pointer justify-center gap-2 rounded-xl bg-[#2DD4BF] px-6 text-sm font-semibold text-[#0B0C0F] shadow-lg shadow-[#2DD4BF]/10 transition-all hover:-translate-y-0.5 hover:bg-[#54E8D0] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {uploading ? "Publishing…" : "Publish video"}
              {!uploading && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-[#2C2F38] bg-[#191A20]">
            <div className="flex items-center justify-between border-b border-[#2C2F38] px-4 py-3">
              <div>
                <h2 className="text-sm font-medium">Video preview</h2>
                <p className="mt-0.5 text-xs text-[#868C99]">
                  Preview how it may appear to viewers
                </p>
              </div>
              <span className="rounded-full border border-[#2C2F38] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#868C99]">
                Preview
              </span>
            </div>
            <div className="aspect-video bg-[#0B0C0F]">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  poster={thumbnailPreview ?? undefined}
                  controls
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Video thumbnail preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-[#727987]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#343741] bg-[#191A20] text-xl text-[#2DD4BF]">
                    ▶
                  </span>
                  <span className="text-xs">Your preview will appear here</span>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">
                {title.trim() || "Your video title"}
              </h3>
              <p className="line-clamp-2 min-h-8 text-xs leading-relaxed text-[#868C99]">
                {description.trim() ||
                  "Your video description will appear here."}
              </p>
              <div className="flex items-center gap-2 border-t border-[#2C2F38] pt-3 text-xs text-[#868C99]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24262F] text-[#2DD4BF]">
                  T
                </span>
                Your channel
                <span className="ml-auto">Just now</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2C2F38] bg-[#191A20] p-4">
            <h2 className="text-sm font-medium">Quick tips</h2>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#868C99]">
              <li className="flex gap-2">
                <span className="text-[#2DD4BF]">✓</span>
                Keep your title clear and easy to find.
              </li>
              <li className="flex gap-2">
                <span className="text-[#2DD4BF]">✓</span>
                Add a thumbnail that shows what the video is about.
              </li>
              <li className="flex gap-2">
                <span className="text-[#2DD4BF]">✓</span>
                Use the description to give viewers helpful context.
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
