const prisma = require('../utils/db');

// @desc   Get all cards in a list
// @route  GET /api/boards/:boardId/lists/:listId/cards
const getCards = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: req.params.listId, boardId: req.params.boardId },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const cards = await prisma.card.findMany({
      where: { listId: req.params.listId },
      orderBy: { position: 'asc' },
    });

    res.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Create card
// @route  POST /api/boards/:boardId/lists/:listId/cards
const createCard = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: req.params.listId, boardId: req.params.boardId },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // En son position'ı bul
    const lastCard = await prisma.card.findFirst({
      where: { listId: req.params.listId },
      orderBy: { position: 'desc' },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        position,
        listId: req.params.listId,
      },
    });

    res.status(201).json({ message: 'Card created successfully', card });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Update card
// @route  PUT /api/boards/:boardId/lists/:listId/cards/:id
const updateCard = async (req, res) => {
  try {
    const { title, description, dueDate, listId, position } = req.body;

    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const updatedCard = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(listId && { listId }),
        ...(position !== undefined && { position }),
      },
    });

    res.json({ message: 'Card updated successfully', card: updatedCard });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Delete card
// @route  DELETE /api/boards/:boardId/lists/:listId/cards/:id
const deleteCard = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const card = await prisma.card.findFirst({
      where: { id: req.params.id, listId: req.params.listId },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.delete({ where: { id: req.params.id } });

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCards, createCard, updateCard, deleteCard };