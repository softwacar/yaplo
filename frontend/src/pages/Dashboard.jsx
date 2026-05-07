import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BoardCardSkeleton } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import Logo from '../components/Logo';

const BOARD_COLORS = [
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Pink',   value: '#ec4899' },
  { label: 'Red',    value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Teal',   value: '#14b8a6' },
  { label: 'Gray',   value: '#6b7280' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [activeTab, setActiveTab] = useState('colors');
  const [unsplashPhotos, setUnsplashPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase()) ||
    board.description?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards');
      setBoards(res.data.boards);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnsplashPhotos = async () => {
    if (unsplashPhotos.length > 0) return;
    setLoadingPhotos(true);
    try {
      const queries = ['nature', 'city', 'abstract', 'mountains', 'ocean'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const res = await fetch(
        `https://api.unsplash.com/photos/random?count=12&query=${randomQuery}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      const data = await res.json();
      setUnsplashPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/boards', {
        title,
        description,
        color: selectedImage ? '#1e293b' : color,
        image: selectedImage || null,
      });
      setBoards([res.data.board, ...boards]);
      setTitle('');
      setDescription('');
      setColor('#3b82f6');
      setSelectedImage(null);
      setActiveTab('colors');
      setShowModal(false);
      toast.success('Board created successfully!');
    } catch (error) {
      toast.error('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = (boardId) => {
    setConfirmModal({
      title: 'Delete Board',
      message: 'Are you sure you want to delete this board? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/boards/${boardId}`);
          setBoards(boards.filter((b) => b.id !== boardId));
          toast.success('Board deleted!');
        } catch (error) {
          toast.error('Failed to delete board');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleUpdateBoard = async (boardId, title) => {
    try {
      await api.put(`/boards/${boardId}`, { title });
      setBoards(boards.map((b) => b.id === boardId ? { ...b, title } : b));
      toast.success('Board updated!');
    } catch (error) {
      toast.error('Failed to update board');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] flex flex-col">

      {/* Top Navbar */}
      <nav className="h-14 bg-white dark:bg-[#1e2a3a] border-b border-gray-200 dark:border-gray-700 flex items-center px-8 gap-3 fixed top-0 left-0 right-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 w-56 flex-shrink-0">
          <Logo size={36} />
          <span className="font-bold text-gray-800 dark:text-white text-lg">Yaplo</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boards..."
            className="w-full bg-gray-100 dark:bg-[#2d3f55] border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-lg">×</button>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto pr-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Welcome, <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.name}!</span>
          </span>

          {/* Avatar Dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {showAvatarMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-[#1e2a3a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => { navigate('/profile'); setShowAvatarMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d3f55] transition flex items-center gap-3"
                >
                  <span>👤</span> Profile
                </button>

                <button
                  onClick={() => { toggleDarkMode(); setShowAvatarMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d3f55] transition flex items-center gap-3"
                >
                  <span>{darkMode ? '☀️' : '🌙'}</span>
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex pt-14 flex-1">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-white dark:bg-[#1e2a3a] border-r border-gray-200 dark:border-gray-700 fixed top-14 bottom-0 left-0 flex flex-col py-4 px-3">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu</p>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-500/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Boards
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d3f55] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </button>
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/30"
            >
              + New Board
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-56 flex-1 px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">My Boards</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {boards.length} board{boards.length !== 1 ? 's' : ''} total
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <BoardCardSkeleton key={i} />)}
              </div>
            ) : filteredBoards.length === 0 ? (
              <div className="text-center py-20">
                {search ? (
                  <>
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No boards found</p>
                    <p className="text-sm text-gray-500">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No boards yet</p>
                    <p className="text-sm text-gray-500 mb-4">Create your first board to get started!</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      + Create Board
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onNavigate={() => navigate(`/boards/${board.id}`)}
                    onDelete={() => handleDeleteBoard(board.id)}
                    onUpdate={handleUpdateBoard}
                  />
                ))}

                <button
                  onClick={() => setShowModal(true)}
                  className="h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-500 transition group"
                >
                  <span className="text-3xl group-hover:scale-110 transition">+</span>
                  <span className="text-sm font-medium">New Board</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#1e2a3a] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Board</h3>
              <button
                onClick={() => { setShowModal(false); setSelectedImage(null); setActiveTab('colors'); }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >×</button>
            </div>

            <form onSubmit={handleCreateBoard} className="p-6 space-y-4">
              {/* Preview */}
              <div
                className="w-full h-24 rounded-xl flex items-end p-3 transition-all relative overflow-hidden"
                style={{
                  backgroundColor: selectedImage ? '#1e293b' : color,
                  backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {selectedImage && <div className="absolute inset-0 bg-black/30" />}
                <span className="text-white font-semibold text-sm opacity-90 relative z-10">
                  {title || 'Board title'}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 dark:bg-[#2d3f55] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('colors')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                    activeTab === 'colors'
                      ? 'bg-white dark:bg-[#1e2a3a] text-gray-800 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  🎨 Colors
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('photos'); fetchUnsplashPhotos(); }}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                    activeTab === 'photos'
                      ? 'bg-white dark:bg-[#1e2a3a] text-gray-800 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  🖼️ Photos
                </button>
              </div>

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="flex gap-2 flex-wrap">
                  {BOARD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => { setColor(c.value); setSelectedImage(null); }}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none relative"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {color === c.value && !selectedImage && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Photos Tab */}
              {activeTab === 'photos' && (
                <div>
                  {loadingPhotos ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6,7,8,9].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {unsplashPhotos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setSelectedImage(photo.urls.regular)}
                          className={`relative h-16 rounded-lg overflow-hidden hover:opacity-90 transition ${
                            selectedImage === photo.urls.regular ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <img
                            src={photo.urls.small}
                            alt={photo.alt_description}
                            className="w-full h-full object-cover"
                          />
                          {selectedImage === photo.urls.regular && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Photos by Unsplash</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2d3f55] dark:text-white"
                  placeholder="My awesome board"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2d3f55] dark:text-white"
                  placeholder="What is this board about?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedImage(null); setActiveTab('colors'); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#2d3f55] transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

// Board Card
function BoardCard({ board, onNavigate, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

  const handleSave = async () => {
    if (!title.trim() || title === board.title) {
      setTitle(board.title);
      setIsEditing(false);
      return;
    }
    await onUpdate(board.id, title);
    setIsEditing(false);
  };

  return (
    <div className="group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
      {/* Color/Image Background */}
      <div
        className="h-24 p-4 flex flex-col justify-between relative overflow-hidden"
        style={{
          backgroundColor: board.color || '#3b82f6',
          backgroundImage: board.image ? `url(${board.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onClick={onNavigate}
      >
        {board.image && <div className="absolute inset-0 bg-black/30" />}
        <div className="flex justify-end relative z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white text-sm transition"
          >
            ×
          </button>
        </div>
        <div className="relative z-10">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') { setTitle(board.title); setIsEditing(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white/20 text-white placeholder-white/70 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
              autoFocus
            />
          ) : (
            <h3
              onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="text-white font-semibold text-sm leading-tight drop-shadow"
            >
              {board.title}
            </h3>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-white dark:bg-[#1e2a3a] px-4 py-3" onClick={onNavigate}>
        {board.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{board.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1">📋 {board.listCount || 0}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">🃏 {board.cardCount || 0}</span>
          </div>
          <span className="text-xs text-gray-300 dark:text-gray-600">
            {new Date(board.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}