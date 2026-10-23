
(() => {
  'use strict';

  const c = window.CINEBREVE || {};
  const $ = id => document.getElementById(id);
  const movies = $('movies');
  const status = $('status');
  const player = $('player');
  const modal = $('modal');

  let films = [];
  let category = 'Todos';

  if ($('tg1')) $('tg1').href = c.TELEGRAM_URL || 'https://t.me/';
  if ($('tg2')) $('tg2').href = c.TELEGRAM_URL || 'https://t.me/';

  if ($('menubtn') && $('nav')) {
    $('menubtn').onclick = () => $('nav').classList.toggle('hidden');
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  })[ch]);

  function render() {
    const query = ($('search')?.value || '').toLowerCase().trim();
    const visible = films.filter(f =>
      (category === 'Todos' || f.category === category) &&
      (f.title + ' ' + f.category + ' ' + f.description)
        .toLowerCase().includes(query)
    );

    if ($('cats')) {
      const cats = ['Todos', ...new Set(films.map(f => f.category))];
      $('cats').innerHTML = cats.map(cat =>
        `<button type="button" data-cat="${esc(cat)}" class="${cat === category ? 'active' : ''}">${esc(cat)}</button>`
      ).join('');

      $('cats').querySelectorAll('[data-cat]').forEach(btn => {
        btn.onclick = () => {
          category = btn.dataset.cat;
          render();
        };
      });
    }

    if (!movies) return;

    movies.innerHTML = visible.map(f => `
      <button type="button" class="movie-card" data-id="${esc(f.id)}">
        ${f.poster
          ? `<img loading="lazy" src="${esc(f.poster)}" alt="${esc(f.title)}">`
          : '<div class="poster-placeholder">▶</div>'}
        <span class="movie-info">
          <b>${esc(f.title)}</b>
          <small>${esc(f.category)}</small>
        </span>
      </button>
    `).join('');

    if (status) {
      status.textContent = visible.length
        ? ''
        : 'No se encontraron películas.';
    }

    movies.querySelectorAll('[data-id]').forEach(btn => {
      btn.onclick = () => {
        const film = films.find(f => String(f.id) === btn.dataset.id);
        if (film) play(film);
      };
    });
  }

  function play(film) {
    if (!modal || !player) return;

    $('ptitle').textContent = film.title;
    $('desc').textContent = film.description || '';
    player.innerHTML = '';

    const url = (film.video_url || '').trim();

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url) ||
        /\/storage\/v1\/object\/public\//i.test(url)) {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.style.width = '100%';

      video.onerror = () => {
        const msg = document.createElement('p');
        msg.textContent = 'No se pudo cargar el video. Comprueba la URL y los permisos del archivo.';
        player.appendChild(msg);
      };

      player.appendChild(video);
    } else if (/youtube\.com\/embed\/|player\.vimeo\.com\/video\//i.test(url)) {
      const frame = document.createElement('iframe');
      frame.src = url;
      frame.title = film.title;
      frame.allowFullscreen = true;
      frame.style.width = '100%';
      frame.style.aspectRatio = '16 / 9';
      player.appendChild(frame);
    } else {
      player.textContent = 'El enlace de este video no es compatible con el reproductor.';
    }

    modal.classList.remove('hidden');
  }

  function closePlayer() {
    modal?.classList.add('hidden');
    if (player) player.innerHTML = '';
  }

  if ($('close')) $('close').onclick = closePlayer;
  if (modal) modal.onclick = e => {
    if (e.target === modal) closePlayer();
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlayer();
  });
  if ($('search')) $('search').addEventListener('input', render);

  async function load() {
    if (!movies || !status) return;

    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) {
      status.textContent = 'Falta la configuración de Supabase.';
      return;
    }

    status.textContent = 'Cargando películas…';

    try {
      const response = await fetch(
        c.SUPABASE_URL.replace(/\/$/, '') +
        '/rest/v1/films?select=*&order=created_at.desc',
        {
          headers: {
            apikey: c.SUPABASE_ANON_KEY,
            Authorization: 'Bearer ' + c.SUPABASE_ANON_KEY
          }
        }
      );

      if (!response.ok) throw new Error('Supabase HTTP ' + response.status);

      const data = await response.json();

      films = data.map(f => ({
        id: f.id,
        title: f.title || 'Película sin título',
        category: f.category || 'Películas',
        description: f.description || '',
        poster: f.poster || f.poster_url || '',
        video_url: f.video_url || f.video_path || ''
      }));

      render();
    } catch (err) {
      console.error(err);
      status.textContent = 'Error al cargar las películas. Revisa la conexión con Supabase.';
    }
  }

  load();
})();
