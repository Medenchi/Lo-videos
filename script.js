document.addEventListener('DOMContentLoaded', () => {
    // --- ВАЖНЫЕ НАСТРОЙКИ ---
    const GITHUB_USERNAME = 'Medenchi';
    const BOT_REPO_NAME = 'loshka-archive-bot';
    const PROXY_REPLIT_URL = 'https://855b47d2-c46d-4235-95ea-ac3f36572222-00-31oo9xrzresoo.sisko.replit.dev'; // Твой Replit-курьер
    // --- КОНЕЦ НАСТРОЕК ---

    const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${BOT_REPO_NAME}/main/videos.json`;
    const videoListContainer = document.getElementById('video-list');

    function getDirectVideoUrl(fileId) {
        return `${PROXY_REPLIT_URL}/stream_video?file_id=${fileId}`;
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
                    const directUrl = getDirectVideoUrl(firstPart.file_id);
                    const player = document.getElementById(`player-${videoData.id}`);
                    player.src = directUrl;
                    videoItem.querySelector('.part-btn')?.classList.add('active');

                    // --- НОВАЯ ЛОГИКА АВТОПЕРЕКЛЮЧЕНИЯ ---
                    player.addEventListener('ended', (event) => {
                        console.log('Видео закончилось, ищем следующую часть...');
                        const currentVideoItem = event.target.closest('.video-item');
                        const activeButton = currentVideoItem.querySelector('.part-btn.active');
                        const allButtons = Array.from(currentVideoItem.querySelectorAll('.part-btn'));
                        
                        const currentIndex = allButtons.indexOf(activeButton);
                        if (currentIndex !== -1 && currentIndex < allButtons.length - 1) {
                            const nextButton = allButtons[currentIndex + 1];
                            console.log('Найдена следующая часть, нажимаю...');
                            nextButton.click(); // Программно "нажимаем" на следующую кнопку
                        } else {
                            console.log('Это была последняя часть.');
                        }
                    });
                }
            }

            document.querySelectorAll('.part-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetButton = e.target;
                    const videoId = targetButton.dataset.videoId;
                    const fileId = targetButton.dataset.fileId;
                    const player = document.getElementById(`player-${videoId}`);
                    
                    const directUrl = getDirectVideoUrl(fileId);
                    player.src = directUrl;
                    player.play(); // Запускаем воспроизведение
                    
                    // Обновляем активную кнопку
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
