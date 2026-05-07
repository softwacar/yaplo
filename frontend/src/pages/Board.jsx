import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import CardModal from '../components/CardModal';
import { getDueDateStatus } from '../utils/dateHelpers';

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
  const [activeCard, setActiveCard] = useState(null);
  const [activeListId, setActiveListId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data.board);
      setLists(res.data.board.lists);
    } catch (error) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const findListByCardId = (cardId) => {
    return lists.find((l) => l.cards.some((c) => c.id === cardId));
  };

  const findCard = (cardId) => {
    for (const list of lists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const handleDragStart = (event) => {
    const card = findCard(event.active.id);
    const list = findListByCardId(event.active.id);
    setActiveCard(card);
    setActiveListId(list?.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeList = findListByCardId(active.id);
    if (!activeList) return;

    // over bir liste mi yoksa kart mı?
    const overList = lists.find((l) => l.id === over.id) ||
                     findListByCardId(over.id);

    if (!overList || activeList.id === overList.id) return;

    // Farklı listeye geçince kartı oraya taşı (geçici)
    setLists((prev) => {
      const activeCard = activeList.cards.find((c) => c.id === active.id);
      const newActive = activeList.cards.filter((c) => c.id !== active.id);

      // over bir kart ise o kartın indexine ekle, değilse sona ekle
      const overCardIndex = overList.cards.findIndex((c) => c.id === over.id);
      const newOver = [...overList.cards];

      if (overCardIndex >= 0) {
        newOver.splice(overCardIndex, 0, { ...activeCard, listId: overList.id });
      } else {
        newOver.push({ ...activeCard, listId: overList.id });
      }

      return prev.map((l) => {
        if (l.id === activeList.id) return { ...l, cards: newActive };
        if (l.id === overList.id) return { ...l, cards: newOver };
        return l;
      });
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveListId(null);

    if (!over) return;

    const currentList = findListByCardId(active.id);
    if (!currentList) return;

    const overList = lists.find((l) => l.id === over.id) ||
                     findListByCardId(over.id);

    if (!overList) return;

    // Aynı liste içinde sıralama
    if (currentList.id === overList.id) {
      const oldIndex = currentList.cards.findIndex((c) => c.id === active.id);
      const newIndex = currentList.cards.findIndex((c) => c.id === over.id);

      if (oldIndex === newIndex) return;

      const newCards = arrayMove(currentList.cards, oldIndex, newIndex).map((c, i) => ({
        ...c,
        position: i,
      }));

      setLists(lists.map((l) => l.id === currentList.id ? { ...l, cards: newCards } : l));

      try {
        await api.put(`/boards/${id}/lists/${currentList.id}/cards/${active.id}`, {
          position: newIndex,
        });
      } catch {
        toast.error('Failed to reorder card');
        fetchBoard();
      }
    } else {
      // Farklı listeye taşıma — DragOver zaten state'i güncelledi
      const newPosition = overList.cards.findIndex((c) => c.id === active.id);
      try {
        await api.put(`/boards/${id}/lists/${activeListId}/cards/${active.id}`, {
          listId: overList.id,
          position: newPosition >= 0 ? newPosition : overList.cards.length - 1,
        });
      } catch {
        toast.error('Failed to move card');
        fetchBoard();
      }
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
    } catch {
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
        } catch {
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
    } catch {
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
        } catch {
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

  const handleUpdateList = async (listId, title) => {
    try {
      await api.put(`/boards/${id}/lists/${listId}`, { title });
      setLists(lists.map((l) => l.id === listId ? { ...l, title } : l));
      toast.success('List updated!');
    } catch {
      toast.error('Failed to update list');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );

  return (
    <div
        className="min-h-screen"
        style={{
          backgroundColor: board?.color || '#3b82f6',
          backgroundImage: board?.image ? `url(${board.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      <nav
          className="px-4 sm:px-6 py-4 flex items-center gap-3 backdrop-blur-sm"
          style={{ backgroundColor: board?.image ? 'rgba(0,0,0,0.4)' : `${board?.color}dd` }}
        >
        <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white transition text-sm flex-shrink-0">
          ← Back
        </button>
        <h1 className="text-white font-bold text-base sm:text-lg truncate">{board?.title}</h1>
      </nav>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-3 sm:p-6 flex gap-3 sm:gap-4 overflow-x-auto min-h-screen items-start">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              onDeleteList={handleDeleteList}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onCardClick={(listId, card) => setSelectedCard({ listId, card })}
              onUpdateList={handleUpdateList}
            />
          ))}

          <div className="flex-shrink-0 w-64 sm:w-72">
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
                  <button type="submit" disabled={addingList} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    {addingList ? 'Adding...' : 'Add List'}
                  </button>
                  <button type="button" onClick={() => setShowAddList(false)} className="text-gray-500 hover:text-gray-700 px-3 py-1.5 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddList(true)} className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 text-sm font-medium transition text-left">
                + Add a list
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="bg-white rounded-lg px-3 py-2 shadow-xl rotate-2 opacity-90 w-64">
              <p className="text-sm text-gray-800">{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

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

// Droppable List Column
function ListColumn({ list, onDeleteList, onAddCard, onDeleteCard, onCardClick, onUpdateList }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    setAdding(true);
    await onAddCard(list.id, cardTitle);
    setCardTitle('');
    setShowAddCard(false);
    setAdding(false);
  };

  const handleTitleSave = async () => {
    if (!listTitle.trim() || listTitle === list.title) {
      setListTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    await onUpdateList(list.id, listTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="flex-shrink-0 w-64 sm:w-72 bg-gray-100 rounded-xl shadow p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditingTitle ? (
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') { setListTitle(list.title); setIsEditingTitle(false); }
            }}
            className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setIsEditingTitle(true)}
            className="font-semibold text-gray-800 text-sm cursor-pointer hover:text-blue-600 transition flex-1"
          >
            {list.title}
            <span className="text-gray-400 font-normal ml-1">({list.cards.length})</span>
          </h3>
        )}
        <button onClick={() => onDeleteList(list.id)} className="text-gray-400 hover:text-red-500 transition text-lg leading-none ml-2">×</button>
      </div>

      {/* Cards */}
      <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2 mb-2 min-h-[40px] rounded-lg transition-colors ${isOver ? 'bg-blue-100/50' : ''}`}
        >
          {list.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(list.id, card.id)}
              onClick={() => onCardClick(list.id, card)}
            />
          ))}
          {list.cards.length === 0 && (
            <div className={`border-2 border-dashed rounded-lg py-4 text-center text-xs transition-colors ${isOver ? 'border-blue-400 text-blue-500' : 'border-gray-300 text-gray-400'}`}>
              {isOver ? 'Release to drop' : 'Drop cards here'}
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Card */}
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
            <button type="submit" disabled={adding} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              {adding ? 'Adding...' : 'Add Card'}
            </button>
            <button type="button" onClick={() => setShowAddCard(false)} className="text-gray-500 hover:text-gray-700 text-sm px-2">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddCard(true)} className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm transition text-left">
          + Add a card
        </button>
      )}
    </div>
  );
}

// Sortable Card
function SortableCard({ card, onDelete, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const dueDateStatus = card.dueDate ? getDueDateStatus(card.dueDate) : null;
  const dueDateColors = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg px-3 py-2 shadow-sm hover:shadow transition group flex items-start justify-between cursor-grab active:cursor-grabbing"
    >
      <div className="flex-1" onClick={onClick}>
        <p className="text-sm text-gray-800">{card.title}</p>
        {card.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{card.description}</p>
        )}
        {dueDateStatus && (
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 font-medium ${dueDateColors[dueDateStatus.color]}`}>
            📅 {dueDateStatus.label}
          </span>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 ml-2 text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}