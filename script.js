document.addEventListener('DOMContentLoaded', () => {
    // --- ВАЖНЫЕ НАСТРОЙКИ ---
    // Я уже вставил твой ник и имя репозитория-бота
    const GITHUB_USERNAME = 'Medenchi';
    const BOT_REPO_NAME = 'loshka-archive-bot'; 
    
    // ▼ ▼ ▼ ВСТАВЬ СЮДА СВОЙ НОВЫЙ ТОКЕН ОТ @BotFather! ▼ ▼ ▼
    const TELEGRAM_BOT_TOKEN = '8319425372:AAHV_k5uEKY4NHWrQjuMPMTzvi3dT-x6_RM'; // ЗАМЕНИ ЭТО НА НОВЫЙ ТОКЕН!
    // ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲

    // --- КОНЕЦ НАСТРОЕК ---

    const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${BOT_REPO_NAME}/main/videos.json`;
    const videoListContainer = document.getElementById('video-list');

    async function getFilePath(fileId) {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
        const data = await response.json();
        if (data.ok) return data.result.file_path;
        return null;
    }

    async function fetchAndRenderVideos() {
        try {
            const response = await fetch(`${JSON_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
            
            const videos = await response.json();
            videoListContainer.innerHTML = '';

            if (videos.length === 0) {
                videoListContainer.innerHTML = '<div class="loading"><p>Видео пока не найдено. Запустите обработку в репозитории бота.</p></div>';
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
                    const filePath = await getFilePath(firstPart.file_id);
                    if (filePath) {
                        const player = document.getElementById(`player-${videoData.id}`);
                        player.src = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
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
                    
                    const filePath = await getFilePath(fileId);
                    if (filePath) {
                        player.src = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
                        player.play();
                    }

                    targetButton.closest('.part-buttons').querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                });
            });

        } catch (error) {
            console.error('Не удалось загрузить видео:', error);
            videoListContainer.innerHTML = `<div class="loading"><p>Ошибка загрузки списка видео. Возможно, файл videos.json еще не создан.</p></div>`;
        }
    }

    fetchAndRenderVideos();
});
