"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const DOCS_URL =
  "https://claude.ai/public/artifacts/3740b3f5-6212-43df-a42a-18ea4386863a?fullscreen=true";

const FloatingActions: React.FC = () => {
  return (
    <>
      <div className="fab-container">
        {/* Documents Button */}
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Documentation / Help Center"
          className="fab-btn fab-docs"
        >
          <Image
            src="/images/docs-icon.png"
            alt="Documents"
            width={60}
            height={60}
            className="fab-icon"
            draggable={false}
          />
        </a>

        {/* Chatbot Button */}
        <Link
          href="/interbot"
          aria-label="AI Assistant / Support Chat"
          className="fab-btn fab-chat"
        >
          <Image
            src="/images/chatbot-icon.png"
            alt="AI Assistant"
            width={68}
            height={68}
            className="fab-icon"
            draggable={false}
          />
        </Link>
      </div>

      <style jsx global>{`
        .fab-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .fab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          background: transparent !important;
          border: none;
          padding: 0;
          animation: fab-float 2.8s ease-in-out infinite;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.3s ease;
        }

        .fab-docs {
          animation-delay: 0.3s;
        }

        .fab-chat {
          animation-delay: 0s;
        }

        /* Icon images — circular clip & shadow */
        .fab-icon {
          border-radius: 50%;
          pointer-events: none;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        /* Hover */
        .fab-btn:hover {
          transform: scale(1.12) translateY(-3px);
        }

        .fab-btn:hover .fab-icon {
          filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.4)) brightness(1.08);
        }

        /* Active / Click */
        .fab-btn:active {
          transform: scale(0.95);
          transition-duration: 0.1s;
        }

        /* Floating Animation */
        @keyframes fab-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .fab-container {
            bottom: 14px;
            right: 14px;
            gap: 10px;
          }
          .fab-icon {
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingActions;
