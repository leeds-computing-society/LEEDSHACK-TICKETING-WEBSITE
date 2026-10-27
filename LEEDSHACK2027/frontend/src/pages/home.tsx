import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../api";

function Home() {
  const [mousePosition, setMousePosition] = useState({
    x: 50,
    y: 50,
  });

  const [activeImage, setActiveImage] = useState(0);

  const pastYears = [
    {
      image: "/images/leedshack26-1.jpg",
      year: "LeedsHack 2026",
      
    },
    {
      image: "/images/leedshack26-2.jpg",
      year: "LeedsHack 2026",
      
    },
    {
      image: "/images/leedshack26-3.jpg",
      year: "LeedsHack 2026",
      
    },
    {
      image: "/images/leedshack26-4.jpg",
      year: "LeedsHack 2026",
      
    },
    {
      image: "/images/leedshack26-5.jpg",
      year: "LeedsHack 2026",
      
    },
    {
      image: "/images/leedshack26-6.jpg",
      year: "LeedsHack 2026",
     
    },
  ];

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((current) => {
        return (current + 1) % pastYears.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [pastYears.length]);

  const nextImage = () => {
    setActiveImage(
      (activeImage + 1) % pastYears.length
    );
  };

  const previousImage = () => {
    setActiveImage(
      (activeImage - 1 + pastYears.length) %
        pastYears.length
    );
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 15%, #7b159f 0%, #3b1254 35%, #14091d 75%)",
        color: "white",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0px) translateX(0px);
            }

            50% {
              transform: translateY(-35px) translateX(20px);
            }

            100% {
              transform: translateY(0px) translateX(0px);
            }
          }

          @keyframes floatReverse {
            0% {
              transform: translateY(0px) translateX(0px);
            }

            50% {
              transform: translateY(30px) translateX(-25px);
            }

            100% {
              transform: translateY(0px) translateX(0px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.25;
              transform: scale(1);
            }

            50% {
              opacity: 0.6;
              transform: scale(1.15);
            }
          }

          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }

            50% {
              background-position: 100% 50%;
            }

            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes gridMove {
            from {
              transform: translateY(0);
            }

            to {
              transform: translateY(40px);
            }
          }

          /* =====================================================
             MOUSE GLOW
             ===================================================== */

          .mouse-glow {
            position: absolute;

            width: 500px;
            height: 500px;

            border-radius: 50%;

            pointer-events: none;

            background:
              radial-gradient(
                circle,
                rgba(194, 41, 253, 0.22) 0%,
                rgba(194, 41, 253, 0.13) 25%,
                rgba(194, 41, 253, 0.07) 45%,
                transparent 70%
              );

            filter: blur(18px);

            transform: translate(-50%, -50%);

            transition:
              left 0.18s ease-out,
              top 0.18s ease-out;

            z-index: 1;
          }

          .mouse-glow-core {
            position: absolute;

            width: 180px;
            height: 180px;

            border-radius: 50%;

            pointer-events: none;

            background:
              radial-gradient(
                circle,
                rgba(194, 41, 253, 0.22) 0%,
                rgba(194, 41, 253, 0.10) 35%,
                transparent 70%
              );

            filter: blur(12px);

            transform: translate(-50%, -50%);

            transition:
              left 0.08s ease-out,
              top 0.08s ease-out;

            z-index: 1;
          }

          /* =====================================================
             FLOATING ORBS
             ===================================================== */

          .floating-orb {
            position: absolute;

            border-radius: 50%;

            filter: blur(3px);

            pointer-events: none;

            z-index: 1;
          }

          /* =====================================================
             HERO
             ===================================================== */

          .hero-title {
            background:
              linear-gradient(
                90deg,
                #ffffff,
                #f0b5ff,
                #c229fd,
                #ffffff
              );

            background-size: 300% 300%;

            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            animation:
              gradientMove 6s ease infinite;
          }

          /* =====================================================
             GLASS CARDS
             ===================================================== */

          .glass-card {
            background:
              rgba(194, 41, 253, 0.08);

            border:
              1px solid rgba(194, 41, 253, 0.22);

            backdrop-filter: blur(14px);

            transition:
              all 0.3s ease;
          }

          .glass-card:hover {
            transform: translateY(-8px);

            border-color:
              rgba(194, 41, 253, 0.7);

            box-shadow:
              0 15px 40px rgba(194, 41, 253, 0.25);
          }

          /* =====================================================
             BUTTONS
             ===================================================== */

          .purple-button {
            background:
              linear-gradient(
                135deg,
                #c229fd,
                #8f16c7
              );

            border: none;

            color: white;

            box-shadow:
              0 8px 25px rgba(194, 41, 253, 0.35);

            transition:
              all 0.3s ease;
          }

          .purple-button:hover {
            transform: translateY(-2px);

            color: white;

            box-shadow:
              0 12px 35px rgba(194, 41, 253, 0.55);
          }

          .outline-button {
            border:
              1px solid rgba(194, 41, 253, 0.7);

            color: #e9a7ff;

            background:
              rgba(194, 41, 253, 0.05);

            transition:
              all 0.3s ease;
          }

          .outline-button:hover {
            background:
              rgba(194, 41, 253, 0.18);

            color: white;

            border-color:
              #c229fd;

            transform:
              translateY(-2px);
          }

          /* =====================================================
             GRID
             ===================================================== */

          .grid-background {
            position: absolute;

            inset: 0;

            opacity: 0.08;

            background-image:
              linear-gradient(
                rgba(194, 41, 253, 0.6) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(194, 41, 253, 0.6) 1px,
                transparent 1px
              );

            background-size: 50px 50px;

            pointer-events: none;

            z-index: 1;
          }

          /* =====================================================
             PAST YEARS CAROUSEL
             ===================================================== */

          .past-years-section {
            position: relative;

            margin-top: 25px;

            margin-bottom: 70px;
          }

          .past-years-card {
            position: relative;

            overflow: hidden;

            padding: 35px 25px 30px;

            border-radius: 28px;

            background:
              rgba(194, 41, 253, 0.08);

            border:
              1px solid rgba(194, 41, 253, 0.22);

            backdrop-filter: blur(14px);

            box-shadow:
              0 15px 40px rgba(0, 0, 0, 0.20),
              0 0 35px rgba(194, 41, 253, 0.08);
          }

          .past-years-card::before {
            content: "";

            position: absolute;

            width: 350px;
            height: 350px;

            top: -180px;
            left: 50%;

            transform:
              translateX(-50%);

            background:
              radial-gradient(
                circle,
                rgba(194, 41, 253, 0.20),
                transparent 70%
              );

            filter: blur(20px);

            pointer-events: none;
          }

          .past-years-title {
            position: relative;

            z-index: 2;

            font-size: 2rem;

            font-weight: 700;

            margin-bottom: 8px;

            background:
              linear-gradient(
                90deg,
                #ffffff,
                #f0b5ff,
                #c229fd
              );

            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .past-years-subtitle {
            position: relative;

            z-index: 2;

            color: #cfa9db;

            margin-bottom: 30px;
          }

          .past-years-carousel {
            position: relative;

            height: 390px;

            display: flex;

            align-items: center;

            justify-content: center;

            overflow: hidden;
          }

          .past-year-image {
            position: absolute;

            width: 55%;
            height: 340px;

            border-radius: 20px;

            overflow: hidden;

            border:
              1px solid rgba(194, 41, 253, 0.35);

            box-shadow:
              0 15px 40px rgba(0, 0, 0, 0.45),
              0 0 30px rgba(194, 41, 253, 0.15);

            transition:
              transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.65s ease,
              filter 0.65s ease,
              box-shadow 0.65s ease;

            user-select: none;
          }

          .past-year-image img {
            width: 100%;

            height: 100%;

            object-fit: cover;

            display: block;
          }

          .past-year-image.active {
            transform:
              translateX(0)
              scale(1);

            opacity: 1;

            z-index: 3;

            filter: brightness(1);

            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.45),
              0 0 25px rgba(194, 41, 253, 0.35),
              0 0 60px rgba(194, 41, 253, 0.15);
          }

          .past-year-image.previous {
            transform:
              translateX(-72%)
              scale(0.78);

            opacity: 0.38;

            z-index: 2;

            filter:
              brightness(0.65)
              saturate(0.8);
          }

          .past-year-image.next {
            transform:
              translateX(72%)
              scale(0.78);

            opacity: 0.38;

            z-index: 2;

            filter:
              brightness(0.65)
              saturate(0.8);
          }

          .past-year-image.hidden {
            transform:
              translateX(0)
              scale(0.65);

            opacity: 0;

            z-index: 1;
          }

          /* =====================================================
             IMAGE OVERLAY
             ===================================================== */

          .past-year-overlay {
            position: absolute;

            bottom: 0;
            left: 0;
            right: 0;

            padding:
              45px
              25px
              22px;

            background:
              linear-gradient(
                transparent,
                rgba(12, 5, 18, 0.92)
              );

            text-align: left;

            pointer-events: none;
          }

          .past-year-overlay h3 {
            color: white;

            font-weight: 700;

            margin-bottom: 4px;

            text-shadow:
              0 2px 10px rgba(0, 0, 0, 0.5);
          }

          .past-year-overlay p {
            color: #dfc7e8;

            margin: 0;

            font-size: 0.9rem;
          }

          /* =====================================================
             CAROUSEL BUTTONS
             ===================================================== */

          .past-years-button {
            position: absolute;

            top: 50%;

            transform:
              translateY(-50%);

            z-index: 5;

            width: 48px;
            height: 48px;

            border-radius: 50%;

            display: flex;

            align-items: center;
            justify-content: center;

            border:
              1px solid rgba(194, 41, 253, 0.45);

            background:
              rgba(194, 41, 253, 0.12);

            color: white;

            backdrop-filter: blur(12px);

            box-shadow:
              0 8px 25px rgba(0, 0, 0, 0.3),
              0 0 18px rgba(194, 41, 253, 0.15);

            transition:
              transform 0.25s ease,
              background 0.25s ease,
              box-shadow 0.25s ease;
          }

          .past-years-button:hover {
            transform:
              translateY(-50%)
              scale(1.08);

            background:
              rgba(194, 41, 253, 0.28);

            border-color:
              rgba(194, 41, 253, 0.8);

            box-shadow:
              0 10px 30px rgba(0, 0, 0, 0.35),
              0 0 25px rgba(194, 41, 253, 0.45);

            color: white;
          }

          .past-years-button.left {
            left: 15px;
          }

          .past-years-button.right {
            right: 15px;
          }

          /* =====================================================
             CAROUSEL DOTS
             ===================================================== */

          .past-years-dots {
            position: relative;

            z-index: 5;

            display: flex;

            justify-content: center;

            gap: 8px;

            margin-top: 22px;
          }

          .past-years-dot {
            width: 8px;
            height: 8px;

            padding: 0;

            border: none;

            border-radius: 50%;

            background:
              rgba(255, 255, 255, 0.25);

            transition:
              width 0.3s ease,
              background 0.3s ease,
              box-shadow 0.3s ease;
          }

          .past-years-dot.active {
            width: 25px;

            border-radius: 10px;

            background: #c229fd;

            box-shadow:
              0 0 8px rgba(194, 41, 253, 0.8),
              0 0 18px rgba(194, 41, 253, 0.4);
          }

          /* =====================================================
             MOBILE
             ===================================================== */

          @media (max-width: 768px) {
            .past-years-card {
              padding:
                25px
                12px
                25px;
            }

            .past-years-carousel {
              height: 300px;
            }

            .past-year-image {
              width: 75%;
              height: 260px;
            }

            .past-year-image.previous {
              transform:
                translateX(-80%)
                scale(0.72);
            }

            .past-year-image.next {
              transform:
                translateX(80%)
                scale(0.72);
            }

            .past-years-button {
              width: 40px;
              height: 40px;
            }

            .past-years-button.left {
              left: 5px;
            }

            .past-years-button.right {
              right: 5px;
            }

            .past-years-title {
              font-size: 1.6rem;
            }

            .past-years-subtitle {
              font-size: 0.9rem;
            }
          }
        `}
      </style>

      {/* =====================================================
          CURSOR GLOW
          ===================================================== */}

      <div
        className="mouse-glow"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      <div
        className="mouse-glow-core"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      {/* =====================================================
          MOVING GRID
          ===================================================== */}

      <div className="grid-background" />

      {/* =====================================================
          FLOATING PURPLE ORBS
          ===================================================== */}

      <div
        className="floating-orb"
        style={{
          width: "300px",
          height: "300px",
          background:
            "rgba(194, 41, 253, 0.28)",
          top: "5%",
          left: "-100px",
          animation:
            "float 9s ease-in-out infinite",
        }}
      />

      <div
        className="floating-orb"
        style={{
          width: "220px",
          height: "220px",
          background:
            "rgba(194, 41, 253, 0.22)",
          top: "35%",
          right: "-80px",
          animation:
            "floatReverse 11s ease-in-out infinite",
        }}
      />

      <div
        className="floating-orb"
        style={{
          width: "140px",
          height: "140px",
          background:
            "rgba(194, 41, 253, 0.25)",
          top: "65%",
          left: "10%",
          animation:
            "pulse 5s ease-in-out infinite",
        }}
      />

      <div
        className="floating-orb"
        style={{
          width: "100px",
          height: "100px",
          background:
            "rgba(233, 167, 255, 0.2)",
          top: "20%",
          right: "15%",
          animation:
            "float 7s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div
        className="container py-5"
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ===================================================
            HERO
            =================================================== */}

        <div className="text-center py-5 mb-5">
          <h1
            className="display-1 fw-bold hero-title"
            style={{
              letterSpacing: "-2px",
            }}
          >
            LeedsHack 2027
          </h1>

          <p
            className="lead mx-auto mt-4"
            style={{
              maxWidth: "700px",
              color: "#e0b9eb",
              fontSize: "1.25rem",
            }}
          >
            Build. Collaborate. Innovate.
            <br />
            Discover what technology can unlock.
          </p>

          {/* Ticket availability */}

          <div
            className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mt-4"
            style={{
              background:
                "rgba(34, 197, 94, 0.08)",
              border:
                "1px solid rgba(34, 197, 94, 0.25)",
              color: "#86efac",
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow:
                  "0 0 10px #4ade80",
              }}
            />

            Tickets currently available
          </div>
        </div>

        {/* ===================================================
            ACTION CARDS
            =================================================== */}

        <div className="row g-4 pb-5">
          {/* REGISTER */}

          <div className="col-md-4">
            <div className="glass-card rounded-4 h-100">
              <div className="card-body p-4 text-center d-flex flex-column">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "70px",
                    height: "70px",
                    background:
                      "rgba(194, 41, 253, 0.15)",
                    border:
                      "1px solid rgba(194, 41, 253, 0.25)",
                    fontSize: "2rem",
                  }}
                >
                  🎟️
                </div>

                <h2 className="h3 fw-bold mb-3">
                  Get Your Ticket
                </h2>

                <p
                  className="flex-grow-1"
                  style={{
                    color: "#cfa9db",
                  }}
                >
                  Register for LeedsHack 2027 and
                  secure your place at the event.
                </p>

                <Link
                  to="/register"
                  className="btn purple-button rounded-pill py-2"
                >
                  Register →
                </Link>
              </div>
            </div>
          </div>

          {/* TEAM */}

          <div className="col-md-4">
            <div className="glass-card rounded-4 h-100">
              <div className="card-body p-4 text-center d-flex flex-column">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "70px",
                    height: "70px",
                    background:
                      "rgba(194, 41, 253, 0.15)",
                    border:
                      "1px solid rgba(194, 41, 253, 0.25)",
                    fontSize: "2rem",
                  }}
                >
                  👥
                </div>

                <h2 className="h3 fw-bold mb-3">
                  Build Your Team
                </h2>

                <p
                  className="flex-grow-1"
                  style={{
                    color: "#cfa9db",
                  }}
                >
                  Create your team or join your
                  teammates before the hackathon begins.
                </p>

                <Link
                  to="/team"
                  className="btn outline-button rounded-pill py-2"
                >
                  Team Signup →
                </Link>
              </div>
            </div>
          </div>

          {/* ADMIN */}

          <div className="col-md-4">
            <div className="glass-card rounded-4 h-100">
              <div className="card-body p-4 text-center d-flex flex-column">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "70px",
                    height: "70px",
                    background:
                      "rgba(194, 41, 253, 0.15)",
                    border:
                      "1px solid rgba(194, 41, 253, 0.25)",
                    fontSize: "2rem",
                  }}
                >
                  ⚙️
                </div>

                <h2 className="h3 fw-bold mb-3">
                  Admin Portal
                </h2>

                <p
                  className="flex-grow-1"
                  style={{
                    color: "#cfa9db",
                  }}
                >
                  Manage registrations, teams and event
                  administration.
                </p>

                <Link
                  to="/admin"
                  className="btn outline-button rounded-pill py-2"
                >
                  Admin →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            LEEDSHACK THROUGH THE YEARS
            =================================================== */}

        <div className="past-years-section">
          <div className="past-years-card">

            <div className="text-center">
              <h2 className="past-years-title">
                What your LeedsHack experience could look like.
              </h2>

              <p className="past-years-subtitle">
                A look back at the ideas, people and
                moments that came before.
              </p>
            </div>

            <div className="past-years-carousel">
              {pastYears.map((item, index) => {
                let position = "hidden";

                if (index === activeImage) {
                  position = "active";
                } else if (
                  index ===
                  (activeImage -
                    1 +
                    pastYears.length) %
                    pastYears.length
                ) {
                  position = "previous";
                } else if (
                  index ===
                  (activeImage + 1) %
                    pastYears.length
                ) {
                  position = "next";
                }

                return (
                  <div
                    key={item.image}
                    className={`past-year-image ${position}`}
                  >
                    <img
                      src={item.image}
                      alt={item.year}
                    />

                    {position === "active" && (
                      <div className="past-year-overlay">
                        <h3>{item.year}</h3>

                        
                      </div>
                    )}
                  </div>
                );
              })}

              {/* PREVIOUS BUTTON */}

              <button
                type="button"
                className="past-years-button left"
                onClick={previousImage}
                aria-label="Previous image"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {/* NEXT BUTTON */}

              <button
                type="button"
                className="past-years-button right"
                onClick={nextImage}
                aria-label="Next image"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            {/* DOTS */}

            <div className="past-years-dots">
              {pastYears.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`past-years-dot ${
                    index === activeImage
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveImage(index)
                  }
                  aria-label={`Go to image ${
                    index + 1
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <div
          className="text-center pt-4 pb-3"
          style={{
            color: "#9f72ad",
          }}
        >
          <small>
            LeedsHack 2027 • University of Leeds
          </small>
        </div>
      </div>
    </div>
  );
}

export default Home;