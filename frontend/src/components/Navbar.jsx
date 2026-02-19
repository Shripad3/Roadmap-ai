import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function Navbar({ user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = user ? user.email.split('@')[0] : 'Guest';
  const location = useLocation();
  const { isDark, setTheme } = useTheme();

  const isActive = (path) => location.pathname === path;
  const navLinkClassName = (path) =>
    `block py-2 px-3 rounded md:p-0 transition-colors ${
      isActive(path)
        ? 'text-white bg-primary-600 md:bg-transparent md:text-primary-600'
        : isDark
        ? 'text-gray-100 hover:text-primary-600'
        : 'text-gray-900 hover:text-primary-600'
    }`;

  return (
    <nav className="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="self-center text-xl text-gray-900 font-semibold whitespace-nowrap">
          AI Task Breakdown
        </Link>

        <div className="flex md:order-2 items-center space-x-3">
          {user && (
            <>
              <span className="hidden md:block text-sm text-gray-600">
                {username}
              </span>

              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="inline-flex items-center justify-center p-1 text-primary-600 hover:text-primary-700 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12.79A9 9 0 1 1 11.21 3c.16 0 .32.01.48.02A7 7 0 0 0 21 12.79z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={onSignOut}
                type="button"
                className="text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none transition-colors"
              >
                Sign Out
              </button>
            </>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" />
            </svg>
          </button>
        </div>

        <div 
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium md:space-x-8 md:flex-row md:mt-0">
            <li>
              <Link to="/" className={navLinkClassName('/')}>
                Tasks
              </Link>
            </li>
            <li>
              <Link to="/ai-breakdown" className={navLinkClassName('/ai-breakdown')}>
                AI Breakdown
              </Link>
            </li>
            <li>
              <Link to="/settings" className={navLinkClassName('/settings')}>
                Settings
              </Link>
            </li>

            {user && (
              <li className="md:hidden border-t border-gray-200 mt-2 pt-2">
                <span className="block py-2 px-3 text-sm text-gray-600">
                  {username}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
