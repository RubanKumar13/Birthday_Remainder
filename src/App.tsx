import { useState, useEffect } from 'react';
import { Plus, Bell, Download, Search } from 'lucide-react';
import MemberCard from './components/MemberCard';
import MemberForm from './components/MemberForm';
import {
  initDB,
  getAllMembers,
  addMember,
  updateMember,
  deleteMember,
  Member,
} from './utils/db';
import {
  requestNotificationPermission,
  scheduleNotificationCheck,
  testNotification,
  getDaysUntilBirthday,
} from './utils/notifications';

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeApp();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const initializeApp = async () => {
    try {
      await initDB();
      await loadMembers();

      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const allMembers = await getAllMembers();
      const sorted = allMembers.sort((a, b) => {
        return getDaysUntilBirthday(a.birthday) - getDaysUntilBirthday(b.birthday);
      });
      setMembers(sorted);
      scheduleNotificationCheck(sorted);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleSaveMember = async (member: Member) => {
    try {
      if (editingMember) {
        await updateMember(member);
      } else {
        await addMember(member);
      }
      await loadMembers();
      setShowForm(false);
      setEditingMember(undefined);
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        await loadMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        testNotification();
      }
    } else {
      testNotification();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Birthday Reminder
            </h1>
            <div className="flex gap-2">
              {notificationPermission !== 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold rounded-full shadow-lg transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  Enable Notifications
                </button>
              )}
              {notificationPermission === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-full shadow-lg transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  Test
                </button>
              )}
            </div>
          </div>

          {showInstallPrompt && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-white" />
                  <p className="text-white font-medium">
                    Install app for quick access and offline use!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    Install
                  </button>
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="px-4 py-2 bg-white bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-400 focus:outline-none transition-colors duration-200"
            />
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎂</div>
              <p className="text-gray-600 text-lg">
                {searchQuery
                  ? 'No members found matching your search.'
                  : 'No birthdays added yet. Start by adding your first member!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setEditingMember(undefined);
            setShowForm(true);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Plus className="w-8 h-8" />
        </button>

        {showForm && (
          <MemberForm
            member={editingMember}
            onSave={handleSaveMember}
            onCancel={() => {
              setShowForm(false);
              setEditingMember(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
