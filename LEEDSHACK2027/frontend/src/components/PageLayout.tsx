import { useState } from "react";

interface PageLayoutProps {
  children: React.ReactNode;
}

function PageLayout({ children }: PageLayoutProps) {
  const [mousePosition, setMousePosition] = useState({
    x: 50,
    y: 50,
  });

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
          /* =====================================================
             ANIMATIONS
             ===================================================== */

          @keyframes float {
            0% {
              transform:
                translateY(0px)
                translateX(0px);
            }

            50% {
              transform:
                translateY(-35px)
                translateX(20px);
            }

            100% {
              transform:
                translateY(0px)
                translateX(0px);
            }
          }

          @keyframes floatReverse {
            0% {
              transform:
                translateY(0px)
                translateX(0px);
            }

            50% {
              transform:
                translateY(30px)
                translateX(-25px);
            }

            100% {
              transform:
                translateY(0px)
                translateX(0px);
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

          /* =====================================================
             CURSOR GLOW
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

            transform:
              translate(-50%, -50%);

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

            transform:
              translate(-50%, -50%);

            transition:
              left 0.08s ease-out,
              top 0.08s ease-out;

            z-index: 1;
          }

          /* =====================================================
             BACKGROUND GRID
             ===================================================== */

          .page-grid {
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
             FLOATING ORBS
             ===================================================== */

          .page-orb {
            position: absolute;

            border-radius: 50%;

            pointer-events: none;

            filter: blur(3px);

            z-index: 1;
          }

          /* =====================================================
             SHARED GLASS CARD
             ===================================================== */

          .page-card {
            position: relative;

            overflow: hidden;

            background:
              linear-gradient(
                135deg,
                rgba(194, 41, 253, 0.12),
                rgba(194, 41, 253, 0.055)
              );

            border:
              1px solid rgba(194, 41, 253, 0.25);

            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);

            border-radius: 20px;

            color: white;

            box-shadow:
              0 15px 40px rgba(0, 0, 0, 0.20),
              0 0 30px rgba(194, 41, 253, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);

            transition:
              transform 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
          }

          .page-card::before {
            content: "";

            position: absolute;

            width: 220px;
            height: 220px;

            top: -120px;
            right: -80px;

            background:
              radial-gradient(
                circle,
                rgba(194, 41, 253, 0.18),
                transparent 70%
              );

            filter: blur(20px);

            pointer-events: none;
          }

          .page-card:hover {
            transform:
              translateY(-4px);

            border-color:
              rgba(194, 41, 253, 0.5);

            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.30),
              0 0 35px rgba(194, 41, 253, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.07);
          }

          /* =====================================================
             PAGE BUTTON
             ===================================================== */

          .page-button {
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

          .page-button:hover {
            color: white;

            transform:
              translateY(-2px);

            box-shadow:
              0 12px 35px rgba(194, 41, 253, 0.55);
          }

          /* =====================================================
             PAGE TITLE
             ===================================================== */

          .page-title {
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

            text-shadow:
              0 0 20px rgba(194, 41, 253, 0.12);
          }

          /* =====================================================
             SECTION ICON
             ===================================================== */

          .page-section-icon {
            width: 45px;
            height: 45px;

            border-radius: 12px;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
              rgba(194, 41, 253, 0.15);

            border:
              1px solid rgba(194, 41, 253, 0.3);

            font-size: 1.2rem;

            box-shadow:
              0 0 18px rgba(194, 41, 253, 0.08);
          }

          /* =====================================================
             LABELS
             ===================================================== */

          .page-label {
            color: #f0c7ff;

            font-weight: 500;
          }

          /* =====================================================
             INPUTS
             ===================================================== */

          .page-input {
            background:
              rgba(0, 0, 0, 0.22) !important;

            border:
              1px solid rgba(255, 255, 255, 0.15) !important;

            color: white !important;

            border-radius: 10px !important;

            transition:
              border-color 0.25s ease,
              box-shadow 0.25s ease,
              background 0.25s ease;
          }

          .page-input:focus {
            background:
              rgba(0, 0, 0, 0.30) !important;

            border-color:
              #c229fd !important;

            box-shadow:
              0 0 0 0.2rem
              rgba(194, 41, 253, 0.18) !important;

            color: white !important;
          }

          .page-input::placeholder {
            color:
              #a889b5 !important;
          }

          .page-input option {
            background:
              #24102d;

            color: white;
          }

          /* =====================================================
             HELP TEXT
             ===================================================== */

          .page-help {
            color:
              #b99bc4 !important;
          }

          /* =====================================================
             CHECKBOXES
             ===================================================== */

          .page-check .form-check-input {
            background-color:
              rgba(0, 0, 0, 0.25);

            border-color:
              rgba(255, 255, 255, 0.25);

            cursor: pointer;
          }

          .page-check .form-check-input:checked {
            background-color:
              #c229fd;

            border-color:
              #c229fd;

            box-shadow:
              0 0 10px rgba(194, 41, 253, 0.25);
          }

          .page-check .form-check-label {
            color:
              #dfd1e5;
          }

          /* =====================================================
             DIVIDER
             ===================================================== */

          .page-divider {
            height: 1px;

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(194, 41, 253, 0.5),
                transparent
              );

            box-shadow:
              0 0 10px rgba(194, 41, 253, 0.08);
          }

          /* =====================================================
             PAGE CONTENT FADE
             ===================================================== */

          .page-content {
            position: relative;

            z-index: 2;

            animation:
              pageFadeIn 0.45s ease;
          }

          @keyframes pageFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
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
          BACKGROUND GRID
          ===================================================== */}

      <div className="page-grid" />

      {/* =====================================================
          FLOATING PURPLE ORBS
          ===================================================== */}

      <div
        className="page-orb"
        style={{
          width: "300px",
          height: "300px",

          background:
            "rgba(194, 41, 253, 0.28)",

          top: "2%",
          left: "-120px",

          animation:
            "float 9s ease-in-out infinite",
        }}
      />

      <div
        className="page-orb"
        style={{
          width: "250px",
          height: "250px",

          background:
            "rgba(194, 41, 253, 0.22)",

          top: "45%",
          right: "-100px",

          animation:
            "floatReverse 11s ease-in-out infinite",
        }}
      />

      <div
        className="page-orb"
        style={{
          width: "130px",
          height: "130px",

          background:
            "rgba(194, 41, 253, 0.25)",

          bottom: "10%",
          left: "15%",

          animation:
            "float 7s ease-in-out infinite",
        }}
      />

      <div
        className="page-orb"
        style={{
          width: "100px",
          height: "100px",

          background:
            "rgba(233, 167, 255, 0.18)",

          top: "22%",
          right: "15%",

          animation:
            "pulse 5s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          ACTUAL PAGE CONTENT
          ===================================================== */}

      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

export default PageLayout;