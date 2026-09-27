import { useParams, Link } from "react-router-dom";
// import { getVideoById } from "../api/video.api";

// TODO: replace with getVideoById(id) once wired to the backend.
const MOCK_VIDEO = {
  title: "Building a RAG assistant from scratch",
  description:
    "Walking through the architecture of a fully local retrieval-augmented generation assistant — vector embeddings, similarity search backends, and how they trade off against each other.",
  views: "18.2K",
  likes: "1.4K",
  uploaded: "3 days ago",
};

const MOCK_COMMENTS = [
  {
    author: "priya_dev",
    text: "The HNSW vs brute-force benchmark numbers are really useful, thanks.",
  },
  {
    author: "codewith_arjun",
    text: "Would love a follow-up on scaling the vector store beyond JSON.",
  },
];

export default function VideoDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        to="/videos"
        className="text-sm text-[#868C99] hover:text-[#F2F3F5]"
      >
        ← Back to videos
      </Link>

      {/* Player placeholder */}
      <div className="aspect-video bg-[#1D1F26] border border-[#2C2F38] rounded-lg flex items-center justify-center text-[#868C99] text-sm">
        Player — video {id}
      </div>

      <div>
        <h1 className="font-display text-xl">{MOCK_VIDEO.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-[#868C99]">
          <span className="tabular-nums">{MOCK_VIDEO.views} views</span>
          <span>·</span>
          <span>{MOCK_VIDEO.uploaded}</span>
          <span className="ml-auto text-[#2DD4BF] tabular-nums">
            {MOCK_VIDEO.likes} likes
          </span>
        </div>
        <p className="mt-4 text-sm text-[#868C99] leading-relaxed">
          {MOCK_VIDEO.description}
        </p>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-sm text-[#868C99] mb-4">
          {MOCK_COMMENTS.length} comments
        </h2>
        <ul className="space-y-4">
          {MOCK_COMMENTS.map((c, i) => (
            <li key={i} className="border-t border-[#2C2F38] pt-4">
              <span className="text-sm text-[#F2F3F5]">{c.author}</span>
              <p className="text-sm text-[#868C99] mt-1">{c.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
