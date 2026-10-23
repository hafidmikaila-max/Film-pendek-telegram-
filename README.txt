CINEBREVE — PAQUETE DEL SITIO WEB PARA VERCEL

ARCHIVOS: index.html (website), style.css, app.js (search/kategori/player), admin.html dan admin.js (admin), config.js (pengaturan), schema.sql (database), vercel.json.

FUENTE DE LOS VIDEOS
Sitio web de origen configurado: https://nontonku-fillm.vercel.app
Paket ini menautkan CineBreve ke NontonKu. Las películas no se copian automáticamente desde NontonKu porque no se ha confirmado una API pública. Añade cada película desde Administración con título, categoría, URL del póster y URL del video o página que tengas permiso para mostrar. Los archivos MP4 directos o las URL de inserción de YouTube/Vimeo pueden reproducirse aquí; otras páginas quizá deban abrirse con el botón del sitio de origen.

1. CREA UNA BASE DE DATOS GRATUITA EN SUPABASE
- Abre https://supabase.com desde el móvil, inicia sesión y crea un proyecto.
- Abre SQL Editor > New query. Copia todo el contenido de schema.sql, pégalo y pulsa Run.
- Abre Project Settings > API / API Keys. Copia Project URL y la clave anon/public.

2. CREA EL ACCESO DE ADMINISTRADOR
- En Supabase, abre Authentication > Users > Add user/Create user.
- Crea un correo y una contraseña segura para el administrador. No compartas la contraseña.

3. CONFIGURA config.js
- Sustituye PASTE_SUPABASE_PROJECT_URL_HERE por Project URL.
- Sustituye PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE por la clave anon/public.
- Sustituye https://t.me/ por el enlace de tu bot o canal de Telegram.
- Nunca incluyas la clave service_role/secret en los archivos del sitio ni en el chat.

4. SUBE LOS ARCHIVOS DESDE EL MÓVIL A VERCEL
- Extrae este ZIP en el móvil.
- Crea un repositorio llamado cinebreve en https://github.com.
- Sube todos los archivos de la carpeta a la raíz del repositorio (no subas solo el ZIP).
- Inicia sesión en https://vercel.com con GitHub, elige Add New > Project e importa el repositorio.
- Si se solicita Framework Preset, elige Other. Pulsa Deploy.

5. PRUEBA EL SITIO
- Abre el dominio .vercel.app que creó Vercel.
- Abre ese dominio seguido de /admin.html.
- Inicia sesión con la cuenta de Supabase. Añade título, categoría, URL del póster y URL del video o página; después, guarda.
- Vuelve a la página principal y prueba la búsqueda y las categorías.

NOTAS
- No uses películas que no sean tuyas o para las que no tengas permiso de publicación.
- La URL del póster debe ser una imagen pública. Una página web normal no siempre puede reproducirse dentro del reproductor.
- Si no puedes iniciar sesión, revisa el usuario en Supabase Authentication. Si no aparecen películas, comprueba que ejecutaste schema.sql y configuraste config.js correctamente.
- RLS limita los cambios en la base de datos a usuarios autenticados. Si no necesitas registros públicos, desactívalos y crea solo cuentas de administrador bajo tu control.
- Los planes gratuitos de Vercel y Supabase tienen límites y sus condiciones pueden cambiar.


PUBLICIDAD DE ADSTERRA (ESPACIOS PREPARADOS)
- La página de reproducción tiene un espacio publicitario justo encima del reproductor.
- Cuando el sitio esté publicado, pega el código de Adsterra correspondiente dentro del elemento #adsterra-slot en index.html.
- Pega únicamente el código del panel de Adsterra. No compartas contraseñas ni tokens de la cuenta.
- Asegúrate de que el formato elegido en Adsterra sea compatible con el espacio. El tamaño y el comportamiento finales dependen del código y del formato de Adsterra.


UBICACIONES DE LA PUBLICIDAD DE ADSTERRA
- Página principal: elemento #adsterra-home-slot.
- Página del reproductor: elemento #adsterra-slot, justo encima del video.
- Pega en cada espacio el código de la unidad publicitaria correspondiente desde el panel de Adsterra.
- Si utilizas dos unidades publicitarias distintas, usa el código proporcionado por Adsterra para cada ubicación.
- Los espacios están preparados, pero los anuncios no aparecerán hasta que se inserte y pruebe el código de Adsterra.
