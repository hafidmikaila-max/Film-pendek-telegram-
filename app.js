(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const config = window.CINEBREVE || {};

  const movies = $('movies');
  const status = $('status');
  const modal = $('modal');
  const player = $('player');

  let films = [];
  let category = 'Todos';

  const escapeHTML = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  if ($('tg1')) {
    $('tg1').href = config.TELEGRAM_URL || 'https://t.me/';
  }

  if ($('tg2')) {
    $('tg2').href = config.TELEGRAM_URL || 'https://t.me/';
  }

  // Menú móvil
  if ($('menubtn') && $('nav')) {
    $('menubtn').addEventListener('click', () => {
      const nav = $('nav');
      nav.classList.toggle('hidden');
      $('menubtn').setAttribute(
        'aria-expanded',
        String(!nav.classList.contains('hidden'))
      );
    });
  }

  // Cerrar reproductor
  function closePlayer() {
    if (player) {
      const video = player.querySelector('video');
      if (video) video.pause();
      player.replaceChildren();
    }

    if (modal) modal.classList.add('hidden');
  }

  if ($('close')) {
    $('close').addEventListener('click', closePlayer);
  }

  if (modal) {
    modal.addEventListener('click', event => {
      if (event.target === modal) closePlayer();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePlayer();
  });

  // Abrir película
  function playFilm(film) {
    if (!modal || !player) {
      console.error('No se encuentra el reproductor.');
      return;
    }

    player.replaceChildren();

    if ($('ptitle')) {
      $('ptitle').textContent = film.title;
    }

    if ($('desc')) {
      $('desc').textContent = film.description || '';
    }

    const url = String(film.video_url || '').trim();

    if (!url) {
      player.textContent = 'El enlace del video no está disponible.';
      modal.classList.remove('hidden');
      return;
    }

    let parsedURL;

    try {
      parsedURL = new URL(url, window.location.href);

      if (!['https:', 'http:'].includes(parsedURL.protocol)) {
        throw new Error('URL no válida');
      }
    } catch (error) {
      player.textContent = 'El enlace del video no es válido.';
      modal.classList.remove('hidden');
      return;
    }

    const hostname = parsedURL.hostname.toLowerCase();
    const isYouTube =
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be';

    const isVimeo =
      hostname === 'vimeo.com' ||
      hostname.endsWith('.vimeo.com');

    if (isYouTube || isVimeo) {
      let embedURL = '';

      if (isYouTube) {
        let videoId = '';

        if (hostname === 'youtu.be') {
          videoId = parsedURL.pathname.split('/').filter(Boolean)[0] || '';
        } else if (parsedURL.pathname === '/watch') {
          videoId = parsedURL.searchParams.get('v') || '';
        } else {
          const match = parsedURL.pathname.match(
            /\/(?:embed|shorts)\/([^/?]+)/
          );
          if (match) videoId = match[1];
        }

        if (videoId) {
          embedURL =
            'https://www.youtube.com/embed/' +
            encodeURIComponent(videoId);
        }
      } else {
        const match = parsedURL.pathname.match(
          /\/(?:video\/)?(\d+)/
        );

        if (match) {
          embedURL = 'https://player.vimeo.com/video/' + match[1];
        }
      }

      if (!embedURL) {
        player.textContent = 'No se reconoce el enlace del video.';
      } else {
        const frame = document.createElement('iframe');
        frame.src = embedURL;
        frame.title = film.title;
        frame.allow =
          'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        frame.style.width = '100%';
        frame.style.aspectRatio = '16 / 9';
        frame.style.border = '0';

        player.appendChild(frame);
      }
    } else {
      const video = document.createElement('video');

      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'contain';

      video.addEventListener('error', () => {
        const message = document.createElement('p');
        message.textContent =
          'No se pudo cargar el video. Comprueba el archivo y su formato.';
        player.replaceChildren(message);
      });

      video.src = parsedURL.href;
      player.appendChild(video);
    }

    modal.classList.remove('hidden');
  }

  // Renderizar catálogo
  function render() {
    if (!movies) return;

    const search = ($('search')?.value || '')
      .toLowerCase()
      .trim();

    const visibleFilms = films.filter(film => {
      const matchesCategory =
        category === 'Todos' || film.category === category;

      const searchableText =
        `${film.title} ${film.category} ${film.description}`
          .toLowerCase();

      return matchesCategory && searchableText.includes(search);
    });

    if ($('cats')) {
      const categories = [
        'Todos',
        ...new Set(films.map(film => film.category))
      ];

      $('cats').replaceChildren();

      categories.forEach(cat => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = cat;
        button.className = cat === category ? 'active' : '';
        button.addEventListener('click', () => {
          category = cat;
          render();
        });

        $('cats').appendChild(button);
      });
    }

    movies.replaceChildren();

    visibleFilms.forEach(film => {
      const card = document.createElement('article');
      card.className = 'movie-card';

      const posterWrap = document.createElement('div');
      posterWrap.className = 'poster-wrap';

      if (film.poster) {
        const image = document.createElement('img');
        image.src = film.poster;
        image.alt = film.title;
        image.loading = 'lazy';

        image.addEventListener('error', () => {
          image.style.display = 'none';
        });

        posterWrap.appendChild(image);
      }

      const playButton = document.createElement('button');
      playButton.type = 'button';
      playButton.className = 'play-badge';
      playButton.textContent = '▶ Reproducir';
      playButton.setAttribute(
        'aria-label',
        'Reproducir ' + film.title
      );

      // Klik langsung pada tombol putar
      playButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        playFilm(film);
      });

      posterWrap.appendChild(playButton);

      const info = document.createElement('div');
      info.className = 'movie-info';

      const title = document.createElement('b');
      title.textContent = film.title;

      const genre = document.createElement('small');
      genre.textContent = film.category;

      info.append(title, genre);
      card.append(posterWrap, info);
      movies.appendChild(card);
    });

    if (status) {
      status.textContent = visibleFilms.length
        ? ''
        : 'No se encontraron películas.';
    }
  }

  // Buscar películas
  if ($('search')) {
    $('search').addEventListener('input', render);
  }

  // Cargar datos de Supabase
  async function loadFilms() {
    if (!movies || !status) return;

    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      status.textContent = 'Falta la configuración de Supabase.';
      return;
    }

    status.textContent = 'Cargando películas…';

    try {
      const response = await fetch(
        config.SUPABASE_URL.replace(/\/$/, '') +
          '/rest/v1/films?select=*&order=created_at.desc',
        {
          headers: {
            apikey: config.SUPABASE_ANON_KEY,
            Authorization: 'Bearer ' + config.SUPABASE_ANON_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error de Supabase: ' + response.status);
      }

      const data = await response.json();

      films = data.map(item => ({
        id: item.id,
        title: item.title || 'Película sin título',
        category: item.category || 'Películas',
        description: item.description || '',
        poster: item.poster || item.poster_url || '',
        video_url: item.video_url || item.video_path || ''
      }));

      render();
    } catch (error) {
      console.error('Error al cargar películas:', error);
      status.textContent =
        'Error al cargar las películas. Inténtalo de nuevo más tarde.';
    }
  }

  loadFilms();
})();
