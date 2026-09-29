import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Check,
  Trash2,
  Save,
} from 'lucide-react';
import type {
  LearningLevel,
  ProgressState,
  ThemeMode,
  UserSettings,
} from '../types/edugenie';
import studentAvatar from '../assets/images/avatar_student_profile_1790662255814.jpg';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  onClearHistory: () => Promise<void>;
  progress: ProgressState;
}

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Mandarin Chinese',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  progress,
}) => {
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [institution, setInstitution] = useState(settings.institution);
  const [theme, setTheme] = useState<ThemeMode>(settings.theme);
  const [learningLevel, setLearningLevel] = useState<LearningLevel>(settings.learningLevel);
  const [preferredLanguage, setPreferredLanguage] = useState(settings.preferredLanguage);
  const [notifications, setNotifications] = useState(settings.notifications);

  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleThemeToggle = async (mode: ThemeMode) => {
    setTheme(mode);
    await onUpdateSettings({ theme: mode });
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings({
        name: name.trim() || 'Student Learner',
        email: email.trim(),
        institution: institution.trim(),
        theme,
        learningLevel,
        preferredLanguage,
        notifications,
      });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    setClearing(true);
    try {
      await onClearHistory();
      setConfirmClear(false);
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 3000);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. Profile Settings */}
        <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              {!avatarError ? (
                <img
                  src={studentAvatar}
                  alt={name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center font-display text-xl font-semibold">
                  {name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  Profile & Preferences
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize your personal learning profile, AI adaptation level, and display theme
                </p>
              </div>
            </div>

            {savedBanner && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Preferences saved ✓</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Academic Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Department / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </section>

        {/* 2. Theme, Learning Level, and Preferred Language */}
        <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Theme & AI Personalization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theme Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Interface Theme
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => handleThemeToggle('light')}
                  className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeToggle('dark')}
                  className={`py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Learning Level */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Default Learning Level
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLearningLevel(lvl)}
                    className={`py-2 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      learningLevel === lvl
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Language */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Preferred AI Response Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 3. Notifications */}
        <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Notifications
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                key: 'dailyReminder' as const,
                title: 'Daily Study Streak Reminder',
                desc: 'Receive a gentle reminder to complete your daily 45-minute learning block.',
              },
              {
                key: 'quizMilestone' as const,
                title: 'Assessment Mastery Alerts',
                desc: 'Notify when new adaptive follow-up quizzes are ready based on your study notes.',
              },
              {
                key: 'weeklyDigest' as const,
                title: 'Weekly Progress Digest',
                desc: 'Summary of topics studied, average quiz scores, and roadmap milestones.',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications[item.key]}
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    notifications[item.key]
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {notifications[item.key] ? 'ON ✓' : 'OFF'}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Preferences...' : 'Save Preferences'}</span>
            </button>
          </div>
        </section>
      </form>

      {/* 4. Clear History */}
      <section className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Clear Learning History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset your quiz attempts ({progress.quizAttemptsCount} logged) and study session history ({progress.studySessions.length} sessions) while keeping your profile preferences intact.
            </p>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="self-start px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start">
              <button
                type="button"
                disabled={clearing}
                onClick={handleConfirmClearHistory}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer whitespace-nowrap"
              >
                {clearing ? 'Clearing...' : 'Confirm Reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {clearedSuccess && (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ Study history and quiz logs have been reset.
          </div>
        )}
      </section>
    </div>
  );
};
