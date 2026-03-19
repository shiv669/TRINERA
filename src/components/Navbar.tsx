"use client";

import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const navLinks = [
    { name: "Gov Schemes", href: "/schemes" },
    { name: "Weather", href: "/weather" },
    { name: "Mandi Rates", href: "/mandi" },
    { name: "News", href: "/news" },
    { name: "Tri (AI Model)", href: "/interbot" },
  ];

  const languages = ["English", "Hindi", "Tamil"];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#2D5A27]">
              TRINERA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-[#2D5A27] font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-[#2D5A27] font-medium transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>{language}</span>
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F4F9F1] hover:text-[#2D5A27]"
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#2D5A27] focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 pb-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-[#2D5A27] font-medium block px-3 py-2 rounded-md hover:bg-[#F4F9F1]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <p className="text-sm text-gray-500 mb-2">Language</p>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`px-3 py-1 text-sm rounded-full ${
                      language === lang 
                        ? 'bg-[#2D5A27] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-[#F4F9F1]'
                    }`}
                    onClick={() => setLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
