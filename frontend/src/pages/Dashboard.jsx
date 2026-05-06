import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BoardCardSkeleton } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';

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
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetchBoards();
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

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/boards', { title, description, color });
      setBoards([res.data.board, ...boards]);
      setTitle('');
      setDescription('');
      setColor('#3b82f6');
      setShowModal(false);
      toast.success('Board created successfully!');
    } catch (error) {
      console.error('Failed to create board:', error);
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
          console.error('Failed to delete board:', error);
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
      console.error('Failed to update board:', error);
      toast.error('Failed to update board');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Yaplo</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Boards</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + New Board
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">No boards yet</p>
            <p className="text-sm">Create your first board to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group"
              >
                <div className="h-2" style={{ backgroundColor: board.color || '#3b82f6' }}></div>
                <div className="bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <BoardTitle
                        board={board}
                        onUpdate={handleUpdateBoard}
                        onNavigate={() => navigate(`/boards/${board.id}`)}
                      />
                      {board.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{board.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          📋 {board.listCount || 0} lists
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          🃏 {board.cardCount || 0} cards
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-gray-300 hover:text-red-500 transition ml-2 text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Board</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My awesome board"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this board about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BOARD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {color === c.value && (
                        <span className="flex items-center justify-center text-white text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
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

function BoardTitle({ board, onUpdate, onNavigate }) {
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

  if (isEditing) {
    return (
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setTitle(board.title);
            setIsEditing(false);
          }
        }}
        className="w-full border border-blue-400 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div>
      <h3
        onClick={onNavigate}
        className="font-semibold text-gray-800 hover:text-blue-600 transition cursor-pointer"
      >
        {board.title}
      </h3>
      <button
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className="text-xs text-gray-400 hover:text-blue-500 transition mt-1"
      >
        ✏️ Edit title
      </button>
    </div>
  );
}