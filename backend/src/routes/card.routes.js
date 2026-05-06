const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCards,
  createCard,
  updateCard,
  deleteCard,
} = require('../controllers/card.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', getCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;