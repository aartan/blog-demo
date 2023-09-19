const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

const blogData = JSON.parse(fs.readFileSync('./scripts/data.json', 'utf8'));

app.get('/api/posts', (req, res) => {
  res.json(blogData);
});

app.get('/api/posts/:id', (req, res) => {
  const post = blogData.data.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ data: post });
});

app.get('/api/posts/:id/comments', (req, res) => {
  const post = blogData.data.find(p => p.id === Number(req.params.id));
  if (!post || !post.comments) return res.status(404).json({ message: 'Comments not found' });
  res.json({ data: post.comments });
});


app.get('/api/tags/:name', (req, res) => {
  const posts = blogData.data.filter(p => p.tags.includes(req.params.name));
  if (posts.length === 0) return res.status(404).json({ message: 'Tag not found' });
  res.json({ data: posts });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});