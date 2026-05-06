import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import CardModal from '../components/CardModal';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data.board);
      setLists(res.data.board.lists);
    } catch (error) {
      console.error('Failed to fetch board:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    setAddingList(true);
    try {
      const res = await api.post(`/boards/${id}/lists`, { title: newListTitle });
      setLists([...lists, { ...res.data.list, cards: [] }]);
      setNewListTitle('');
      setShowAddList(false);
      toast.success('List added!');
    } catch (error) {
      console.error('Failed to add list:', error);
      toast.error('Failed to add list');
    } finally {
      setAddingList(false);
    }
  };

  const handleDeleteList = (listId) => {
    setConfirmModal({
      title: 'Delete List',
      message: 'Are you sure? All cards in this list will be deleted.',
      onConfirm: async () => {
        try {
          await api.delete(`/boards/${id}/lists/${listId}`);
          setLists(lists.filter((l) => l.id !== listId));
          toast.success('List deleted!');
        } catch (error) {
          console.error('Failed to delete list:', error);
          toast.error('Failed to delete list');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleAddCard = async (listId, title) => {
    try {
      const res = await api.post(`/boards/${id}/lists/${listId}/cards`, { title });
      setLists(lists.map((l) =>
        l.id === listId ? { ...l, cards: [...l.cards, res.data.card] } : l
      ));
      toast.success('Card added!');
    } catch (error) {
      console.error('Failed to add card:', error);
      toast.error('Failed to add card');
    }
  };

  const handleDeleteCard = (listId, cardId) => {
    setConfirmModal({
      title: 'Delete Card',
      message: 'Are you sure you want to delete this card?',
      onConfirm: async () => {
        try {
          await api.delete(`/boards/${id}/lists/${listId}/cards/${cardId}`);
          setLists(lists.map((l) =>
            l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
          ));
          toast.success('Card deleted!');
        } catch (error) {
          console.error('Failed to delete card:', error);
          toast.error('Failed to delete card');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleUpdateCard = (listId, updatedCard) => {
    setLists(lists.map((l) =>
      l.id === listId
        ? { ...l, cards: l.cards.map((c) => c.id === updatedCard.id ? updatedCard : c) }
        : l
    ));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-blue-600">
      {/* Navbar */}
      <nav className="bg-blue-700 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-200 hover:text-white transition text-sm"
        >
          ← Dashboard
        </button>
        <h1 className="text-white font-bold text-lg">{board?.title}</h1>
      </nav>

      {/* Board Content */}
      <div className="p-6 flex gap-4 overflow-x-auto min-h-screen items-start">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onDeleteList={handleDeleteList}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onCardClick={(listId, card) => setSelectedCard({ listId, card })}
          />
        ))}

        {/* Add List */}
        <div className="flex-shrink-0 w-72">
          {showAddList ? (
            <form onSubmit={handleAddList} className="bg-white rounded-xl p-3 shadow">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder="List title..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingList}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  {addingList ? 'Adding...' : 'Add List'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddList(false)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddList(true)}
              className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 text-sm font-medium transition text-left"
            >
              + Add a list
            </button>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          listId={selectedCard.listId}
          boardId={id}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
        />
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

// List Column Component
function ListColumn({ list, onDeleteList, onAddCard, onDeleteCard, onCardClick }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    setAdding(true);
    await onAddCard(list.id, cardTitle);
    setCardTitle('');
    setShowAddCard(false);
    setAdding(false);
  };

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl shadow p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{list.title}</h3>
        <button
          onClick={() => onDeleteList(list.id)}
          className="text-gray-400 hover:text-red-500 transition text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-2">
        {list.cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={() => onDeleteCard(list.id, card.id)}
            onClick={() => onCardClick(list.id, card)}
          />
        ))}
      </div>

      {showAddCard ? (
        <form onSubmit={handleAddCard}>
          <textarea
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
            placeholder="Card title..."
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              {adding ? 'Adding...' : 'Add Card'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddCard(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm transition text-left"
        >
          + Add a card
        </button>
      )}
    </div>
  );
}

// Card Item Component
function CardItem({ card, onDelete, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg px-3 py-2 shadow-sm hover:shadow transition group flex items-start justify-between cursor-pointer"
    >
      <div className="flex-1">
        <p className="text-sm text-gray-800">{card.title}</p>
        {card.description && (
          <p className="text-xs text-gray-400 mt-1">{card.description}</p>
        )}
        {card.dueDate && (
          <p className="text-xs text-blue-500 mt-1">
            📅 {new Date(card.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 ml-2 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}