import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-transparent py-8 border-t border-secondary/15">
      <div className="page-container px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <Link to="/" className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-surface border border-secondary/15 rounded-lg shadow-sm">
            <img
              src="/Skillify.png"
              alt="Skillify"
              className="h-7 w-7 object-contain"
            />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-primary">
            Skillify
          </h3>
        </Link>
        <p className="text-sm text-center leading-relaxed max-w-md mb-8 text-secondary">
          Build your career by shipping real projects with the perfect team.
          Discover opportunities, collaborate with clients, and grow.
        </p>

        <div className="w-full max-w-md pt-6 flex flex-col items-center justify-center gap-2 text-sm md:flex-row md:justify-between border-t border-secondary/15 text-secondary">
          <p>© {currentYear} Skillify. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed with{" "}
            <span className="text-lg leading-none text-error-500">
              ♥
            </span>{" "}
            for freelancers
          </p>
        </div>
      </div>
    </footer>
  );
}
