export default function Avatar({ user, className = "h-9 w-9" }) {
  const name = user?.fullName ?? user?.username ?? "?";

  return (
    <div
      className={`${className} shrink-0 rounded-full bg-[#24262F] overflow-hidden flex items-center justify-center text-sm text-[#F2F3F5]`}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
