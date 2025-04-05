"use client";

import { DIcons } from "dicons";
import { useTheme } from "next-themes";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const Footer = () => {
  const { setTheme } = useTheme();

  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 tracking-wider uppercase">
              About Us
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              Pest Detection and Treatment System - Making agriculture smarter and safer.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                <DIcons.X className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                <DIcons.GitBranchPlus className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                <DIcons.LinkedIn className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 tracking-wider uppercase">
                  Quick Links
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      Services
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 tracking-wider uppercase">
                  Resources
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-base text-neutral-500 dark:text-neutral-400">
              © 2025 Trinera. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center rounded-full border border-dotted p-1">
                <button
                  onClick={() => setTheme("light")}
                  className="bg-black mr-2 rounded-full p-2 text-white dark:bg-background dark:text-white"
                >
                  <DIcons.Sun className="h-4 w-4" strokeWidth={1} />
                  <span className="sr-only">Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={handleScrollTop}
                  className="mx-2"
                >
                  <DIcons.ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Scroll to top</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className="dark:bg-black ml-2 rounded-full p-2 text-black dark:text-white"
                >
                  <DIcons.Moon className="h-4 w-4" strokeWidth={1} />
                  <span className="sr-only">Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
