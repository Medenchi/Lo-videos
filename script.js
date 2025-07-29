document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------------
    // ▼ ▼ ▼ Я ВСТАВИЛ ТВОЮ ССЫЛКУ. БОЛЬШЕ НИЧЕГО МЕНЯТЬ НЕ НУЖНО ▼ ▼ ▼
    // -----------------------------------------------------------------
    
    const REPLIT_JSON_URL = 'https://855b47d2-c46d-4235-95ea-ac3f36572222-00-31oo9xrzresoo.sisko.replit.dev/videos_cloudinary.json';

    // -----------------------------------------------------------------
    // ▲ ▲ ▲ ВСЕ ГОТОВО ▲ ▲ ▲
    // -----------------------------------------------------------------

    const videoListContainer = document.getElementById('video-list');

    async function fetchAndRenderVideos() {
        try {
            // Добавляем параметр, чтобы обойти кэширование браузера
            const response = await fetch(`${REPLIT_JSON_URL}?t=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error(`Ошибка сети: статус ${response.status}. Проверь, запущен ли проект на Replit.`);
            }

            const videos = await response.json();

            // Очищаем сообщение о загрузке
            videoListContainer.innerHTML = '';

            if (videos.length === 0) {
                videoListContainer.innerHTML = '<div class="loading"><p>Видео пока не найдено. Возможно, они еще не скачались.</p></div>';
                return;
            }

            videos.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                videoItem.innerHTML = `
                    <h2>${video.title}</h2>
                    <video controls preload="metadata">
                        <source src="${video.url}" type="video/mp4">
                        Ваш браузер не поддерживает это видео.
                    </video>
                `;
                videoListContainer.appendChild(videoItem);
            });

        } catch (error) {
            console.error('Не удалось загрузить видео:', error);
            videoListContainer.innerHTML = `<div class="loading"><p>Не удалось загрузить список видео. <br>Проверьте консоль браузера (F12) или убедитесь, что ссылка в script.js верна и проект на Replit работает.</p></div>`;
        }
    }

    fetchAndRenderVideos();
});
