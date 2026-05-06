const prisma = require('../utils/db');

// @desc   Get all lists in a board
// @route  GET /api/boards/:boardId/lists
const getLists = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const lists = await prisma.list.findMany({
      where: { boardId: req.params.boardId },
      orderBy: { position: 'asc' },
      include: {
        cards: { orderBy: { position: 'asc' } },
      },
    });

    res.json({ lists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Create list
// @route  POST /api/boards/:boardId/lists
const createList = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // En son position'ı bul
    const lastList = await prisma.list.findFirst({
      where: { boardId: req.params.boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastList ? lastList.position + 1 : 0;

    const list = await prisma.list.create({
      data: { title, position, boardId: req.params.boardId },
    });

    res.status(201).json({ message: 'List created successfully', list });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Update list
// @route  PUT /api/boards/:boardId/lists/:id
const updateList = async (req, res) => {
  try {
    const { title } = req.body;

    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: req.params.id, boardId: req.params.boardId },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const updatedList = await prisma.list.update({
      where: { id: req.params.id },
      data: { title },
    });

    res.json({ message: 'List updated successfully', list: updatedList });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Delete list
// @route  DELETE /api/boards/:boardId/lists/:id
const deleteList = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.boardId, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const list = await prisma.list.findFirst({
      where: { id: req.params.id, boardId: req.params.boardId },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    await prisma.list.delete({ where: { id: req.params.id } });

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getLists, createList, updateList, deleteList };