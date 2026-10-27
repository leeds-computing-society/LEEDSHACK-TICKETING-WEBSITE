import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const [mousePosition, setMousePosition] = useState({
    x: 50,
    y: 50,
  });

  const handleMouseMove = (
    event: React.MouseEvent<HTMLAnchorElement>,
    linkName: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setHoveredLink(linkName);
    setMousePosition({ x, y });
  };

  return (
    <>
      <style>
        {`
          /* =========================
             NAVBAR
             ========================= */

          .navbar-custom {
            background:
              linear-gradient(
                135deg,
                #8b2ba3 0%,
                #7b2393 45%,
                #681c7e 100%
              ) !important;

            border-bottom: 1px solid rgba(194, 41, 253, 0.55);

            box-shadow:
              0 4px 18px rgba(0, 0, 0, 0.28),
              0 8px 30px rgba(194, 41, 253, 0.20),
              0 0 45px rgba(194, 41, 253, 0.10);

            position: relative;
            z-index: 10;
          }

          /* Subtle purple light along the bottom */
          .navbar-custom::after {
            content: "";
            position: absolute;
            left: 5%;
            right: 5%;
            bottom: -1px;
            height: 1px;

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(194, 41, 253, 0.9),
                rgba(233, 167, 255, 0.8),
                rgba(194, 41, 253, 0.9),
                transparent
              );

            box-shadow:
              0 0 8px rgba(194, 41, 253, 0.65),
              0 0 18px rgba(194, 41, 253, 0.35);

            pointer-events: none;
          }


          /* =========================
             BRAND
             ========================= */

          .navbar-brand-custom {
            color: #ffffff !important;
            font-size: 1.25rem;
            letter-spacing: -0.02em;

            text-shadow:
              0 0 8px rgba(255, 255, 255, 0.15),
              0 0 18px rgba(194, 41, 253, 0.35);

            transition:
              text-shadow 0.3s ease,
              transform 0.3s ease;
          }

          .navbar-brand-custom:hover {
            transform: translateY(-1px);

            text-shadow:
              0 0 8px rgba(255, 255, 255, 0.45),
              0 0 18px rgba(194, 41, 253, 0.75),
              0 0 30px rgba(194, 41, 253, 0.4);
          }


          /* =========================
             LOGO
             ========================= */

          .navbar-logo {
            width: 38px;
            height: 38px;
            object-fit: contain;
            border-radius: 50%;
            margin-right: 10px;

            border: 1px solid rgba(233, 167, 255, 0.55);

            box-shadow:
              0 0 8px rgba(194, 41, 253, 0.45),
              0 0 18px rgba(194, 41, 253, 0.35),
              0 0 30px rgba(194, 41, 253, 0.18);

            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }

          .navbar-brand-custom:hover .navbar-logo {
            transform: scale(1.05);

            box-shadow:
              0 0 10px rgba(233, 167, 255, 0.65),
              0 0 22px rgba(194, 41, 253, 0.65),
              0 0 38px rgba(194, 41, 253, 0.35);
          }


          /* =========================
             NAVIGATION LINKS
             ========================= */

          .navbar-link {
            position: relative;
            overflow: hidden;

            color: #ffffff !important;

            font-weight: 500;

            border-radius: 10px;

            padding: 8px 12px !important;

            text-shadow:
              0 0 6px rgba(255, 255, 255, 0.10),
              0 0 14px rgba(194, 41, 253, 0.25);

            transition:
              color 0.25s ease,
              background 0.25s ease,
              text-shadow 0.25s ease,
              transform 0.25s ease;
          }


          /* =========================
             CURSOR FOLLOWING GLOW
             ========================= */

          .navbar-link::before {
            content: "";

            position: absolute;

            width: 100px;
            height: 100px;

            left: calc(var(--mouse-x, 50%) - 50px);
            top: calc(var(--mouse-y, 50%) - 50px);

            background:
              radial-gradient(
                circle,
                rgba(233, 167, 255, 0.35) 0%,
                rgba(194, 41, 253, 0.32) 25%,
                rgba(194, 41, 253, 0.16) 48%,
                transparent 72%
              );

            filter: blur(9px);

            opacity: 0;

            transition:
              left 0.10s ease-out,
              top 0.10s ease-out,
              opacity 0.3s ease;

            pointer-events: none;
          }

          .navbar-link:hover::before {
            opacity: 1;
          }


          /* Soft glass highlight */

          .navbar-link::after {
            content: "";

            position: absolute;

            inset: 0;

            border-radius: 10px;

            background:
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.08),
                rgba(194, 41, 253, 0.08),
                transparent
              );

            opacity: 0;

            transition: opacity 0.25s ease;

            pointer-events: none;
          }

          .navbar-link:hover::after {
            opacity: 1;
          }


          /* =========================
             LINK HOVER
             ========================= */

          .navbar-link:hover {
            background:
              rgba(194, 41, 253, 0.22);

            transform: translateY(-1px);

            text-shadow:
              0 0 5px rgba(255, 255, 255, 0.85),
              0 0 12px rgba(233, 167, 255, 0.8),
              0 0 20px rgba(194, 41, 253, 0.9),
              0 0 32px rgba(194, 41, 253, 0.45);

            box-shadow:
              inset 0 0 12px rgba(194, 41, 253, 0.15),
              0 0 12px rgba(194, 41, 253, 0.18);
          }


          /* =========================
             ICONS
             ========================= */

          .navbar-link i {
            position: relative;
            z-index: 1;

            color: #e9a7ff;

            transition:
              color 0.25s ease,
              filter 0.25s ease,
              transform 0.25s ease;
          }

          .navbar-link:hover i {
            color: #ffffff;

            transform: scale(1.08);

            filter:
              drop-shadow(0 0 4px rgba(233, 167, 255, 0.9))
              drop-shadow(0 0 10px rgba(194, 41, 253, 0.9))
              drop-shadow(0 0 18px rgba(194, 41, 253, 0.55));
          }


          /* Keep text above the glow */

          .navbar-link {
            isolation: isolate;
          }

          .navbar-link i,
          .navbar-link {
            z-index: 1;
          }


          /* =========================
             MOBILE MENU
             ========================= */

          .navbar-toggler {
            border-color: rgba(233, 167, 255, 0.45);

            box-shadow:
              0 0 10px rgba(194, 41, 253, 0.15);

            transition:
              box-shadow 0.25s ease,
              border-color 0.25s ease;
          }

          .navbar-toggler:hover {
            border-color: rgba(233, 167, 255, 0.75);

            box-shadow:
              0 0 10px rgba(194, 41, 253, 0.35),
              0 0 20px rgba(194, 41, 253, 0.18);
          }

          .navbar-toggler:focus {
            box-shadow:
              0 0 0 0.2rem rgba(194, 41, 253, 0.22),
              0 0 18px rgba(194, 41, 253, 0.25);
          }

          .navbar-toggler-icon {
            filter: brightness(0) invert(1);
          }
        `}
      </style>

      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">

          {/* Logo */}
          <Link
            className="navbar-brand navbar-brand-custom fw-bold d-flex align-items-center"
            to="/"
          >
            <img
              src="/logo.png"
              alt="LeedsHack logo"
              className="navbar-logo"
            />

            LeedsHack 2027
          </Link>


          {/* Mobile button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>


          {/* Navigation */}
          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto gap-lg-1">

              {/* Home */}
              <li className="nav-item">
                <Link
                  className="nav-link navbar-link"
                  to="/"
                  style={
                    hoveredLink === "home"
                      ? ({
                          "--mouse-x": `${mousePosition.x}%`,
                          "--mouse-y": `${mousePosition.y}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  onMouseMove={(event) =>
                    handleMouseMove(event, "home")
                  }
                  onMouseEnter={() => setHoveredLink("home")}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <i className="bi bi-house-fill me-1"></i>
                  Home
                </Link>
              </li>


              {/* Register */}
              <li className="nav-item">
                <Link
                  className="nav-link navbar-link"
                  to="/register"
                  style={
                    hoveredLink === "register"
                      ? ({
                          "--mouse-x": `${mousePosition.x}%`,
                          "--mouse-y": `${mousePosition.y}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  onMouseMove={(event) =>
                    handleMouseMove(event, "register")
                  }
                  onMouseEnter={() => setHoveredLink("register")}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <i className="bi bi-ticket-fill me-1"></i>
                  Register
                </Link>
              </li>


              {/* Team Signup */}
              <li className="nav-item">
                <Link
                  className="nav-link navbar-link"
                  to="/team"
                  style={
                    hoveredLink === "team"
                      ? ({
                          "--mouse-x": `${mousePosition.x}%`,
                          "--mouse-y": `${mousePosition.y}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  onMouseMove={(event) =>
                    handleMouseMove(event, "team")
                  }
                  onMouseEnter={() => setHoveredLink("team")}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <i className="bi bi-people-fill me-1"></i>
                  Team Signup
                </Link>
              </li>


              {/* Admin */}
              <li className="nav-item">
                <Link
                  className="nav-link navbar-link"
                  to="/admin"
                  style={
                    hoveredLink === "admin"
                      ? ({
                          "--mouse-x": `${mousePosition.x}%`,
                          "--mouse-y": `${mousePosition.y}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  onMouseMove={(event) =>
                    handleMouseMove(event, "admin")
                  }
                  onMouseEnter={() => setHoveredLink("admin")}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <i className="bi bi-shield-lock-fill me-1"></i>
                  Admin
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;