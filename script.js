document.addEventListener('DOMContentLoaded', () => {
    // --- ВАЖНЫЕ НАСТРОЙКИ ---
    const GITHUB_USERNAME = 'Medenchi';
    const BOT_REPO_NAME = 'loshka-archive-bot';
    
    // ▼▼▼ ВСТАВЬ СЮДА ССЫЛКУ НА ТВОЙ НОВЫЙ ПРОЕКТ REPLIT-"КУРЬЕР" ▼▼▼
    const PROXY_REPLIT_URL = 'https://855b47d2-c46d-4235-95ea-ac3f36572222-00-31oo9xrzresoo.sisko.replit.dev/'; // Замени на свою ссылку!
    // ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲

    // --- КОНЕЦ НАСТРОЕК ---

    const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${BOT_REPO_NAME}/main/videos.json`;
    const videoListContainer = document.getElementById('video-list');

    // --- НОВАЯ ФУНКЦИЯ: Обращается к нашему "курьеру" на Replit ---
    async function getDirectVideoUrl(fileId) {
        try {
            const response = await fetch(`${PROXY_REPLIT_URL}/get_video_url?file_id=${fileId}`);
            const data = await response.json();
            if (data.url) {
                return data.url;
            } else {
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
            if (videos.length === 0) { /* ... код для пустой витрины ... */ return; }

            for (const videoData of videos) {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                let videoHTML = `<h2>${videoData.title}</h2><video id="player-${videoData.id}" controls preload="metadata"></video>`;
                if (videoData.parts && videoData.parts.length > 1) { /* ... код для кнопок ... */ }
                videoItem.innerHTML = videoHTML;
                videoListContainer.appendChild(videoItem);

                const firstPart = videoData.parts?.[0];
                if (firstPart) {
                    const directUrl = await getDirectVideoUrl(firstPart.file_id); // Используем новую функцию
                    if (directUrl) {
                        const player = document.getElementById(`player-${videoData.id}`);
                        player.src = directUrl;
                        videoItem.querySelector('.part-btn')?.classList.add('active');
                    }
                }
            }

            document.querySelectorAll('.part-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const targetButton = e.target;
                    const videoId = targetButton.dataset.videoId;
                    const fileId = targetButton.dataset.fileId;
                    const player = document.getElementById(`player-${videoId}`);
                    
                    const directUrl = await getDirectVideoUrl(fileId); // Используем новую функцию
                    if (directUrl) {
                        player.src = directUrl;
                        player.play();
                    }
                    targetButton.closest('.part-buttons').querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                });
            });
        } catch (error) { /* ... код для обработки ошибок ... */ }
    }
    fetchAndRenderVideos();
});
