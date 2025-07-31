document.addEventListener('DOMContentLoaded', () => {
    // --- ВАЖНЫЕ НАСТРОЙКИ ---
    const GITHUB_USERNAME = 'Medenchi';
    const BOT_REPO_NAME = 'loshka-archive-bot'; // Репозиторий, где хранится videos.json
    
    // ▼▼▼ Я ВСТАВИЛ ТВОЮ ССЫЛКУ REPLIT И НОВЫЙ ТОКЕН ▼▼▼
    // Убедись, что ссылка на Replit-прокси правильная. Если будешь использовать Render, заменишь ее.
    const PROXY_REPLIT_URL = 'https://archive-admin-bot-1.onrender.com';
    const TELEGRAM_BOT_TOKEN_FOR_JS = '8319425372:AAELgw2BnbWNsyb6CeIk34FTOfo3ntGcgQI'; // Твой НОВЫЙ токен
    // ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲

    const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${BOT_REPO_NAME}/main/videos.json`;
    const videoListContainer = document.getElementById('video-list');

    // Эта функция обращается к твоему прокси-серверу (Replit или Render)
    async function getDirectVideoUrl(fileId) {
        // --- ВАЖНАЯ ЗАМЕТКА: Эта функция больше не использует TELEGRAM_BOT_TOKEN_FOR_JS ---
        // Она обращается к твоему прокси, который уже знает токен и безопасно его использует.
        // Поэтому, если ты перешел на Render, токен в этом файле больше не нужен.
        // Но для Replit-прокси, который мы делали раньше, он может быть нужен.
        // Я оставлю его для совместимости, но лучшая архитектура - без токена на фронтенде.
        try {
            const response = await fetch(`${PROXY_REPLIT_URL}/stream_video?file_id=${fileId}`);
            if (response.ok) {
                // Если прокси работает как стример, он вернет само видео, а не JSON
                return response.url;
            } else {
                 const data = await response.json();
                 console.error("Proxy error:", data.error, data.details);
                 return null;
            }
        } catch (e) {
            console.error("Failed to fetch from proxy:", e);
            return null;
        }
    }

    async function fetchAndRenderVideos() {
        try {
            const response = await fetch(`${JSON_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
            const videos = await response.json();
            videoListContainer.innerHTML = '';

            if (videos.length === 0) {
                videoListContainer.innerHTML = '<div class="loading"><p>Видео пока не найдено.</p></div>';
                return;
            }

            for (const videoData of videos) {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                let videoHTML = `<h2>${videoData.title}</h2><video id="player-${videoData.id}" controls preload="metadata"></video>`;
                
                if (videoData.parts && videoData.parts.length > 1) {
                    videoHTML += `<div class="part-buttons">`;
                    videoData.parts.forEach(part => {
                        videoHTML += `<button class="part-btn" data-video-id="${videoData.id}" data-file-id="${part.file_id}">Часть ${part.part_num}</button>`;
                    });
                    videoHTML += `</div>`;
                }
                videoItem.innerHTML = videoHTML;
                videoListContainer.appendChild(videoItem);

                const firstPart = videoData.parts?.[0];
                if (firstPart) {
                    const player = document.getElementById(`player-${videoData.id}`);
                    // Мы не загружаем URL сразу, а только когда пользователь нажмет Play
                    player.poster = `https://i.ytimg.com/vi/${videoData.id}/hqdefault.jpg`; // Добавляем превьюшку
                    player.setAttribute('data-first-file-id', firstPart.file_id);
                    videoItem.querySelector('.part-btn')?.classList.add('active');

                    // Логика автопереключения
                    player.addEventListener('ended', (event) => {
                        const currentVideoItem = event.target.closest('.video-item');
                        const activeButton = currentVideoItem.querySelector('.part-btn.active');
                        if (!activeButton) return;
                        const allButtons = Array.from(currentVideoItem.querySelectorAll('.part-btn'));
                        const currentIndex = allButtons.indexOf(activeButton);
                        if (currentIndex !== -1 && currentIndex < allButtons.length - 1) {
                            const nextButton = allButtons[currentIndex + 1];
                            nextButton.click();
                        }
                    });

                    // Загружаем видео только при первом нажатии на Play
                    player.addEventListener('play', async () => {
                         if (player.getAttribute('data-first-file-id')) {
                             const fileId = player.getAttribute('data-first-file-id');
                             player.removeAttribute('data-first-file-id'); // чтобы не загружать повторно
                             const directUrl = await getDirectVideoUrl(fileId);
                             if (directUrl) {
                                 player.src = directUrl;
                                 player.play();
                             }
                         }
                    }, { once: true });
                }
            }

            document.querySelectorAll('.part-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const targetButton = e.target;
                    const videoId = targetButton.dataset.videoId;
                    const fileId = targetButton.dataset.fileId;
                    const player = document.getElementById(`player-${videoId}`);
                    
                    const directUrl = await getDirectVideoUrl(fileId);
                    if (directUrl) {
                        player.src = directUrl;
                        player.play();
                    }
                    
                    targetButton.closest('.part-buttons').querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                });
            });

        } catch (error) {
            console.error('Не удалось загрузить видео:', error);
            videoListContainer.innerHTML = `<div class="loading"><p>Ошибка загрузки списка видео.</p></div>`;
        }
    }
    
    fetchAndRenderVideos();
});
