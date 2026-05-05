const express = require('express');
const router = express.Router();
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/board.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate); // Tüm board route'ları korumalı

router.get('/', getBoards);
router.get('/:id', getBoard);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;