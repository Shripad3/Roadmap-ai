import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();

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
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive updates about your tasks
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    Coming soon...
                  </p>
                </div>
                <button disabled className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 opacity-50 cursor-not-allowed">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-sm text-gray-700 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn bg-red-600 text-white hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}