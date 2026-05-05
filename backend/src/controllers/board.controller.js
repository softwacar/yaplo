const prisma = require('../utils/db');

// @desc   Get all boards
// @route  GET /api/boards
const getBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Get single board
// @route  GET /api/boards/:id
const getBoard = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Create board
// @route  POST /api/boards
const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.create({
      data: { title, description, userId: req.userId },
    });

    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Update board
// @route  PUT /api/boards/:id
const updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = await prisma.board.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: req.params.id },
      data: { title, description },
    });

    res.json({ message: 'Board updated successfully', board: updatedBoard });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc   Delete board
// @route  DELETE /api/boards/:id
const deleteBoard = async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await prisma.board.delete({ where: { id: req.params.id } });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getBoards, getBoard, createBoard, updateBoard, deleteBoard };