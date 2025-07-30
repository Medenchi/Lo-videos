document.addEventListener('DOMContentLoaded', () => {
    // --- ВАЖНЫЕ НАСТРОЙКИ ---
    const GITHUB_USERNAME = 'Medenchi';
    const BOT_REPO_NAME = 'loshka-archive-bot';
    const TELEGRAM_BOT_TOKEN = '8319425372:AAHV_k5uEKY4NHWrQjuMPMTzvi3dT-x6_RM'; // Не забудь обновить!
    // --- КОНЕЦ НАСТРОЕК ---

    const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${BOT_REPO_NAME}/main/videos.json`;
    const videoListContainer = document.getElementById('video-list');
    const spoilerCheckbox = document.getElementById('no-spoilers-checkbox');

    // --- НОВАЯ ФУНКЦИЯ: Превращает время "ММ:СС" в секунды ---
    function timeToSeconds(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return 0;
    }
    
    // --- НОВАЯ ФУНКЦИЯ: Перематывает плеер, если нужно ---
    function handleSpoilerCheck(player) {
        if (spoilerCheckbox.checked && player.dataset.spoilerTime) {
            const spoilerSeconds = timeToSeconds(player.dataset.spoilerTime);
            if (spoilerSeconds > 0 && player.currentTime < spoilerSeconds) {
                player.currentTime = spoilerSeconds;
            }
        }
    }

    async function getFilePath(fileId) {
        // ... (эта функция без изменений)
    }

    async function fetchAndRenderVideos() {
        try {
            // ... (код загрузки и проверки videos.json)
            
            for (const videoData of videos) {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                // --- ИЗМЕНЕНИЕ: Добавляем data-атрибут с таймкодом ---
                const spoilerTimeAttr = videoData.spoiler_end_time ? `data-spoiler-time="${videoData.spoiler_end_time}"` : '';

                let videoHTML = `<h2>${videoData.title}</h2><video id="player-${videoData.id}" ${spoilerTimeAttr} controls preload="metadata"></video>`;
                
                // ... (код для создания кнопок частей)
                videoItem.innerHTML = videoHTML;
                videoListContainer.appendChild(videoItem);

                const firstPart = videoData.parts?.[0];
                if (firstPart) {
                    const filePath = await getFilePath(firstPart.file_id);
                    if (filePath) {
                        const player = document.getElementById(`player-${videoData.id}`);
                        player.src = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
                        videoItem.querySelector('.part-btn')?.classList.add('active');
                        
                        // --- ИЗМЕНЕНИЕ: Сразу проверяем на спойлер при загрузке ---
                        player.onloadedmetadata = () => handleSpoilerCheck(player);
                    }
                }
            }

            document.querySelectorAll('.part-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    // ... (старый код)
                    if (filePath) {
                        player.src = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
                        // --- ИЗМЕНЕНИЕ: Проверяем на спойлер при смене части ---
                        player.onloadedmetadata = () => handleSpoilerCheck(player);
                        player.play();
                    }
                    // ... (старый код)
                });
            });

        } catch (error) {
            // ... (старый код)
        }
    }

    // --- НОВЫЙ КОД: Слушаем изменение галочки ---
    spoilerCheckbox.addEventListener('change', () => {
        document.querySelectorAll('video').forEach(player => {
            if (!spoilerCheckbox.checked && player.currentTime > 0) {
                // Если галочку сняли, не сбрасываем, даем пользователю смотреть дальше
            } else {
                handleSpoilerCheck(player);
            }
        });
    });

    fetchAndRenderVideos();
});
