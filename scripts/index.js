const render = (pID, s) => {
  let p = document.getElementById(pID);
  let t = document.createElement('div');
  p.innerHTML = '';
  t.innerHTML = s;
  while (t.firstChild) { p.appendChild(t.firstChild); }
};

const postTemplate = (p, detailed) => {
  const previewBody = !detailed ? p.body.substring(0, 200) + '...' : p.body;

  return `
    <div class="post">
      <p class="title">${p.title}</p>
      <p class="meta">
        <span>${p.tags.map(t => `<a href="/tags/${t}">${t}</a>`).join(', ')}</span>
        <span class="separator">&#x2022;</span>
        <span>${(new Date(p.created_at)).toLocaleString('en-GB', ({ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}</span>
      </p>
      <div class="headline">${p.headline}</div>
      ${detailed ? `
        <div class="body">${previewBody}</div>
        <div id="comments"></div>
      ` : `
        <div class="body">${previewBody}</div>
        <a class="continue" href="/posts/${p.id}">Continue reading</a>
      `}
    </div>
  `;
}


const fourOFourTemplate = () => {
  return `<div class="post"><p class="title" style="text-align: center;">404. Nothing to see here!</p></div>`;
}

const commentTemplate = (c) => {
  return `
    <div class="comment">
      <p class="body">${c.body}</p>
      <p class="meta">
        <span>${c.author}</span>
        <span class="separator">&#x2022;</span>
        <span>${(new Date(c.created_at)).toLocaleString('en-GB', ({ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}</span>
      </p>
    </div>
  `;
}

const requirementsTemplate = () => {
  return `
<div class="post">
      <p class="title" style="text-align: center; margin-bottom: 50px;">API requirements</p>
      <div class="headline">
        <p>1. Serve the given resources as a SPA</p>
        <ul>
          <li><code>/index.html</code></li>
          <li><code>/styles/index.css</code></li>
          <li><code>/scripts/index.js</code></li>
        </ul>
      </div>
      <div class="headline">
        <p>2. Create the following endpoints</p>
        <ul>
          <li><code>GET /api/posts</code></li>
          <li><code>GET /api/posts/:id</code></li>
          <li><code>GET /api/posts/:id/comments</code></li>
          <li><code>GET /api/tags/:name</code></li>
        </ul>
      </div>
      <div class="headline">
        <p>2.1. <code>GET /api/posts</code> response example:</p>
        <pre style="margin-top: 10px;">
{
  "data": [
    {
      "id": 1,
      "title": "...",
      "headline": "...",
      "body": "...",
      "created_at": "2023-02-11",
      "tags": ["Sports"]
    },
    {
      "id": 2,
      "title": "...",
      "headline": "...",
      "body": "...",
      "created_at": "2023-02-10",
      "tags": ["Business", "Tech"]
    },
    {
      "id": 3,
      "title": "...",
      "headline": "...",
      "body": "...",
      "created_at": "2023-02-09",
      "tags": ["Economy"]
    }
  ]
}
        </pre>
      </div>
      <div class="headline">
        <p>2.2. <code>GET /api/posts/:id</code> response example:</p>
        <pre style="margin-top: 10px;">
{
  "data": {
    "id": 1,
    "title": "...",
    "headline": "...",
    "body": "...",
    "created_at": "2023-02-11",
    "tags": ["Sports"]
  }
}
        </pre>
      </div>
      <div class="headline">
        <p>2.3. <code>GET /api/posts/:id/comments</code> response example:</p>
        <pre style="margin-top: 10px;">
{
  "data": [
    {
      "id": 1,
      "created_at": "2023-02-13",
      "author": "Test User A",
      "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      "id": 2,
      "created_at": "2023-02-12",
      "author": "Test User B",
      "body": "Etiam tincidunt fermentum felis, quis luctus lectus suscipit nec."
    }
  ]
}
        </pre>
      </div>
      <div class="headline">
        <p>2.4. <code>GET /api/tags/:name</code> response example (same as 2.1.)</p>
      <div class="headline">
        <p>NOTES:</p>
        <p>You don't have to use a database for it! You can use a simple object or JSON to store the data, but try to separate it at least in a different file!</p>
        <p>For simplicity you can return a 400 whenever it makes sense (for example post doesn't exist with a given id).</p>
      </div>
    </div>
  `;
}

const route = window.location.pathname;

if (route === '/' || route === '/posts') {
  fetch('/api/posts')
    .then((res) => res.json())
    .then((res) => {
      if (res.data.length === 0) {
        render('content', '<div class="post"><p class="title" style="text-align: center;">There are no posts yet. Come back later!</p></div>');
      } else {
        render('content', res.data.map(p => postTemplate(p)).join(''));
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
} else if (route.startsWith('/posts/')) {
  let id = route.split('/').slice(-1);

  fetch(`/api/posts/${id}`)
    .then((res) => res.json())
    .then((res) => {
      render('content', postTemplate(res.data, true));

      fetch(`/api/posts/${id}/comments`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data.length === 0) {
            render('comments', '<div class="comment"><p style="text-align: center;">There are no comments yet.</p></div>');
          } else {
            render('comments', res.data.map(c => commentTemplate(c)).join(''));
          }
        })
    })
    .catch((error) => {
      render('content', fourOFourTemplate());
    });
} else if (route.startsWith('/tags/')) {
  let id = route.split('/').slice(-1);

  fetch(`/api/tags/${id}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.data.length === 0) {
        render('content', '<div class="post"><p class="title" style="text-align: center;">There are no posts yet. Come back later!</p></div>');
      } else {
        render('content', res.data.map(p => postTemplate(p)).join(''));
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
} else if (route.startsWith('/requirements')) {
  render('content', requirementsTemplate());
} else {
  render('content', fourOFourTemplate());
}
