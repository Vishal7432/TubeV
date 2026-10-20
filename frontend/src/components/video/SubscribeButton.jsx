import { useState } from "react";
import { toggleSubscription } from "../../apis/subscription.api";

export default function SubscribeButton({
  channelId,
  initialSubscribed = false,
  onToggle,
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);

    // Optimistic update, rolled back if the request fails.
    const next = !subscribed;
    setSubscribed(next);
    onToggle?.(next);

    try {
      await toggleSubscription(channelId);
    } catch {
      setSubscribed(!next);
      onToggle?.(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        subscribed
          ? "bg-[#1D1F26] border border-[#2C2F38] text-[#F2F3F5] hover:border-[#F2F3F5]/30"
          : "bg-[#F2F3F5] text-[#14151A] hover:bg-white"
      }`}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
