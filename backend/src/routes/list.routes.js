const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getLists,
  createList,
  updateList,
  deleteList,
} = require('../controllers/list.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', getLists);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

module.exports = router;