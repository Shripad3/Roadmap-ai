import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as api from '../services/api';

const ONBOARDING_KEY = 'roadmap_onboarded';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleThemeToggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  function handleDeleteAccountButton() {
    setIsDeleteModalOpen(true);
  }
  async function handleDeleteAccount() {
    try {
      setDeleteError(null);
      setIsDeleting(true);
      await api.deleteAccount();
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
    } catch (err) {
      setDeleteError('Failed to delete account. Please try again');
      console.log(err);
      setIsDeleting(false);
    }
  }



  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your account and preferences.
        </p>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your email address cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.id || ''}
                  disabled
                  className="input bg-gray-50 cursor-not-allowed text-xs"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              {/* Email notification toggle */}
              {/* <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive updates about your tasks
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 hover:cursor-not-allowed">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div> */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    Current theme: {theme}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  aria-label="Toggle dark mode"
                  aria-pressed={isDark}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsDeleteModalOpen(false)} />
              <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md mx-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is permanent and cannot be undone. Type <strong>DELETE</strong> to confirm.
                </p>

                <input
                  type="text"
                  className="input w-full mb-4"
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />

                {deleteError && <p className="text-red-600 text-sm mb-3">{deleteError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
                    onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmText(''); }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tour & Help */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold mb-4">Tour & Help</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Onboarding Tour</p>
                <p className="text-sm text-gray-500">Walk through the key features again</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem(ONBOARDING_KEY);
                  navigate('/tasks');
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
              >
                Restart Tour
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <div
              className={`border rounded-lg p-4 ${isDark ? 'border-red-700 bg-red-950/40' : 'border-red-200 bg-red-50'
                }`}
            >
              <p className={`text-sm mb-3 ${isDark ? 'text-red-100' : 'text-gray-700'}`}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteAccountButton} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
                {deleteError && <p className="text-red-600 text-sm mt-2">{deleteError}</p>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
