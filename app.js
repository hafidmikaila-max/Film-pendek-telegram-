
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

  if ($('tg1')) {
    $('tg1').href = c.TELEGRAM_URL || 'https://t.me/';
  }

  if ($('tg2')) {
    $('tg2').href = c.TELEGRAM_URL || 'https://t.me/';
  }

  if ($('menubtn') && $('nav')) {
    $('menubtn').onclick = () => {
      $('nav').classList.toggle('hidden');
    };
  }

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);

  function render() {
    if (!movies) return;

    const query = ($('search')?.value || '')
      .toLowerCase()
      .trim();

    const visible = films.filter(f =>
      (category === 'Todos' || f.category === category) &&
      (f.title + ' ' + f.category + ' ' + f.description)
        .toLowerCase()
        .includes(query)
    );

    if ($('cats')) {
      const cats = [
        'Todos',
        ...new Set(films.map(f => f.category))
      ];

      $('cats').innerHTML = cats.map(cat => `
        <button
          type="button"
          data-cat="${esc(cat)}"
          class="${cat === category ? 'active' : ''}"
        >${esc(cat)}</button>
      `).join('');

      $('cats').querySelectorAll('[data-cat]').forEach(btn => {
        btn.onclick = () => {
          category = btn.dataset.cat;
          render();
        };
      });
    }

    // Kartu film dan tombol putar
    movies.innerHTML = visible.map(f => `
      <button
        type="button"
        class="movie-card"
        data-id="${esc(f.id)}"
        aria-label="Reproducir ${esc(f.title)}"
        style="position:relative;display:block;width:100%;cursor:pointer;"
      >
        <span
          class="poster-wrap"
          style="position:relative;display:block;width:100%;overflow:hidden;"
        >
          ${
            f.poster
              ? `<img
                   loading="lazy"
                   src="${esc(f.poster)}"
                   alt="${esc(f.title)}"
                   style="display:block;width:100%;height:auto;object-fit:cover;"
                 >`
              : '<span class="poster-placeholder">▶</span>'
          }

          <span
            style="
              position:absolute;
              top:50%;
              left:50%;
              transform:translate(-50%,-50%);
              background:#e50914;
              color:#fff;
              padding:12px 18px;
              border-radius:30px;
              font-size:14px;
              font-weight:bold;
              white-space:nowrap;
              z-index:99;
              display:block;
              visibility:visible;
              opacity:1;
              pointer-events:none;
            "
          >▶ Reproducir</span>
        </span>

        <span class="movie-info" style="display:block;padding:10px;">
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
        const film = films.find(
          f => String(f.id) === btn.dataset.id
        );

        if (film) play(film);
      };
    });
  }

  function play(film) {
    if (!modal || !player) return;

    const title = $('ptitle');
    const desc = $('desc');

    if (title) title.textContent = film.title;
    if (desc) desc.textContent = film.description || '';

    player.innerHTML = '';

    const url = (film.video_url || '').trim();

    if (
      /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) ||
      /\/storage\/v1\/object\/public\//i.test(url)
    ) {
      const video = document.createElement('video');

      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.style.width = '100%';

      video.onerror = () => {
        const msg = document.createElement('p');
        msg.textContent =
          'No se pudo cargar el video. Comprueba el enlace.';
        player.appendChild(msg);
      };

      player.appendChild(video);

    } else if (
      /youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?/i.test(url) ||
      /player\.vimeo\.com\/video\//i.test(url)
    ) {
      let embedUrl = url;

      try {
        const parsed = new URL(url);

        if (
          parsed.hostname === 'youtu.be' ||
          parsed.hostname.endsWith('.youtu.be')
        ) {
          embedUrl =
            'https://www.youtube.com/embed/' +
            parsed.pathname.slice(1);

        } else if (
          parsed.hostname.includes('youtube.com') &&
          parsed.pathname === '/watch'
        ) {
          const videoId = parsed.searchParams.get('v');

          if (videoId) {
            embedUrl =
              'https://www.youtube.com/embed/' + videoId;
          }
        }
      } catch (_) {}

      const frame = document.createElement('iframe');

      frame.src = embedUrl;
      frame.title = film.title;
      frame.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.style.width = '100%';
      frame.style.aspectRatio = '16 / 9';

      player.appendChild(frame);

    } else {
      player.textContent =
        'El enlace de este video no es compatible con el reproductor.';
    }

    modal.classList.remove('hidden');
  }

  function closePlayer() {
    if (modal) modal.classList.add('hidden');
    if (player) player.innerHTML = '';
  }

  if ($('close')) {
    $('close').onclick = closePlayer;
  }

  if (modal) {
    modal.onclick = e => {
      if (e.target === modal) closePlayer();
    };
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePlayer();
  });

  if ($('search')) {
    $('search').addEventListener('input', render);
  }

  async function load() {
    if (!movies || !status) return;

    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) {
      status.textContent =
        'Falta la configuración de Supabase.';
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

      if (!response.ok) {
        throw new Error('Supabase HTTP ' + response.status);
      }

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
      status.textContent =
        'Error al cargar las películas. Revisa la conexión con Supabase.';
    }
  }

  load();
})();
