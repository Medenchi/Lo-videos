document.addEventListener('DOMContentLoaded', () => {
    // Не забудь вставить сюда свою ссылку на Replit!
    const REPLIT_JSON_URL = 'https://855b47d2-c46d-4235-95ea-ac3f36572222-00-31oo9xrzresoo.sisko.replit.dev/videos_cloudinary_chunked.json';

    const videoListContainer = document.getElementById('video-list');

    async function fetchAndRenderVideos() {
        try {
            const response = await fetch(`${REPLIT_JSON_URL}?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
            
            const videos = await response.json();
            videoListContainer.innerHTML = '';

            if (videos.length === 0) {
                videoListContainer.innerHTML = '<div class="loading"><p>Видео пока не найдено.</p></div>';
                return;
            }

            videos.forEach(videoData => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                // Создаем плеер и заголовок
                let videoHTML = `<h2>${videoData.title}</h2><video id="player-${videoData.id}" controls preload="metadata"></video>`;
                
                // Если видео состоит из нескольких частей, добавляем кнопки
                if (videoData.parts && videoData.parts.length > 1) {
                    videoHTML += `<div class="part-buttons">`;
                    videoData.parts.forEach(part => {
                        videoHTML += `<button class="part-btn" data-video-id="${videoData.id}" data-part-url="${part.url}">Часть ${part.part_num}</button>`;
                    });
                    videoHTML += `</div>`;
                }

                videoItem.innerHTML = videoHTML;
                videoListContainer.appendChild(videoItem);

                // Устанавливаем источник для первого видео
                const player = document.getElementById(`player-${videoData.id}`);
                if (videoData.parts && videoData.parts.length > 0) {
                    player.src = videoData.parts[0].url;
                    // Выделяем первую кнопку
                    videoItem.querySelector('.part-btn')?.classList.add('active');
                }
            });

            // Добавляем обработчики событий для всех кнопок
            document.querySelectorAll('.part-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetButton = e.target;
                    const videoId = targetButton.dataset.videoId;
                    const partUrl = targetButton.dataset.partUrl;
                    const player = document.getElementById(`player-${videoId}`);
                    
                    player.src = partUrl;
                    player.play();

                    // Управление активным состоянием кнопок
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
