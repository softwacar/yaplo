export const getDueDateStatus = (dueDate) => {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: 'red' };
  if (diffDays === 0) return { label: 'Due today', color: 'yellow' };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, color: 'orange' };
  return { label: due.toLocaleDateString(), color: 'green' };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};