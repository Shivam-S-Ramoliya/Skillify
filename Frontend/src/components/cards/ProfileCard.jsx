import { Link } from "react-router-dom";

export default function ProfileCard({ user }) {
  return (
    <article className="group surface-card-hover flex h-full flex-col overflow-hidden">
      <div
        className="h-24 relative overflow-hidden bg-primary opacity-90"
      ></div>

      <div className="-mt-10 px-6 pb-6 flex flex-col flex-grow relative z-10">
        <div className="flex items-end gap-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-20 w-20 rounded-2xl border-2 border-surface object-cover shadow-md bg-neutral group-hover:scale-105 transition-transform duration-200 relative z-20"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-surface text-2xl font-bold text-white shadow-md relative z-20 bg-tertiary group-hover:scale-105 transition-transform duration-200"
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="pb-1">
            <h3
              className="line-clamp-1 text-lg font-bold text-primary transition-colors"
            >
              {user.name}
            </h3>
            {user.username && (
              <p className="line-clamp-1 text-[11px] font-bold text-secondary/70">
                @{user.username}
              </p>
            )}
            {(user.currentRole || user.company) && (
              <p
                className="line-clamp-1 text-xs font-bold text-tertiary mt-0.5"
              >
                {[user.currentRole, user.company].filter(Boolean).join(" at ")}
              </p>
            )}
          </div>
        </div>

        {user.location && (
          <p
            className="mt-4 text-sm font-semibold flex items-center gap-1.5 text-secondary"
          >
            <svg
              className="w-4 h-4 text-secondary/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {user.location}
          </p>
        )}

        {user.bio && (
          <p
            className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-secondary flex-grow"
          >
            {user.bio}
          </p>
        )}

        {user.skills?.length > 0 && (
          <div
            className="mt-4 pt-4 flex flex-wrap gap-2 border-t border-secondary/15"
          >
            {user.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="badge-primary !py-1 !px-2.5 !rounded-[8px] !text-[10px]"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span
                className="badge-neutral !py-1 !px-2.5 !rounded-[8px] !text-[10px]"
              >
                +{user.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          to={user.username ? `/profile/${user.username}` : `/profile/${user._id}`}
          className="mt-5 w-full block text-center btn-secondary !py-2.5 !px-4 !text-sm !rounded-[10px]"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
