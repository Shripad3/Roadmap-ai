import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = user ? user.email.split('@')[0] : 'Guest';
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-200 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <Link
                to="/"
                className={`block py-2 px-3 rounded md:p-0 transition-colors ${
                  isActive('/') 
                    ? 'text-white bg-primary-600 md:bg-transparent md:text-primary-600' 
                    : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary-600'
                }`}
              >
                Tasks
              </Link>
            </li>
            <li>
              <Link
                to="/ai-breakdown"
                className={`block py-2 px-3 rounded md:p-0 transition-colors ${
                  isActive('/ai-breakdown') 
                    ? 'text-white bg-primary-600 md:bg-transparent md:text-primary-600' 
                    : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary-600'
                }`}
              >
                AI Breakdown
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`block py-2 px-3 rounded md:p-0 transition-colors ${
                  isActive('/settings') 
                    ? 'text-white bg-primary-600 md:bg-transparent md:text-primary-600' 
                    : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-primary-600'
                }`}
              >
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