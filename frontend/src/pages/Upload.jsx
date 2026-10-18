import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../apis/Vidoe.api.js";

const MAX_VIDEO_MB = 100; // matches the multer limit on the backend

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleVideoChange(file) {
    if (file && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`Video must be smaller than ${MAX_VIDEO_MB} MB.`);
      setVideoFile(null);
      return;
    }
    setError(null);
    setVideoFile(file);
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
    <div className="max-w-xl">
      <h1 className="font-display text-2xl">Upload video</h1>
      <p className="text-sm text-[#868C99] mt-1">
        Share something with the community
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs text-[#868C99]">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs text-[#868C99]">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#1D1F26] border border-[#2C2F38] rounded-md px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#868C99]">
            Video file (max {MAX_VIDEO_MB} MB)
          </label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
            onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-[#868C99] file:mr-3 file:py-1.5 file:px-3 file:rounded-md
                       file:border file:border-[#2C2F38] file:bg-[#1D1F26] file:text-[#F2F3F5] file:text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#868C99]">Thumbnail image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-[#868C99] file:mr-3 file:py-1.5 file:px-3 file:rounded-md
                       file:border file:border-[#2C2F38] file:bg-[#1D1F26] file:text-[#F2F3F5] file:text-xs"
          />
        </div>

        {uploading && (
          <div>
            <div className="h-1.5 w-full bg-[#1D1F26] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2DD4BF] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#868C99] mt-2 tabular-nums">
              {progress < 100
                ? `Uploading… ${progress}%`
                : "Processing on the server…"}
            </p>
          </div>
        )}

        {error && <p className="text-xs text-[#FF4757]">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="bg-[#2DD4BF] text-[#0B0C0F] text-sm font-medium rounded-md px-5 py-2
                     hover:bg-[#2DD4BF]/90 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
