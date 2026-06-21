class MediaPlayer {
    constructor() {
        this.videoPlayer = document.getElementById('mediaPlayer');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.currentFileIndex = -1;
        this.playlist = [];
        this.currentFileEl = document.getElementById('currentFile');
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupPlayerEvents();
    }

    setPlaylist(files) {
        this.playlist = files;
        if (files.length > 0 && this.currentFileIndex === -1) {
            this.playFile(0);
        } else if (files.length === 0) {
            this.clearPlaylist();
        }
    }

    clearPlaylist() {
        this.playlist = [];
        this.currentFileIndex = -1;
        this.stopPlayback();
        this.currentFileEl.textContent = 'Нет файла';
    }

    playFile(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentFileIndex = index;
            const file = this.playlist[index];
            
            // Скрываем оба плеера
            this.videoPlayer.style.display = 'none';
            this.audioPlayer.style.display = 'none';
            
            if (file.type === 'video') {
                this.videoPlayer.src = file.url;
                this.videoPlayer.style.display = 'block';
                this.videoPlayer.load();
                this.videoPlayer.play();
            } else {
                this.audioPlayer.src = file.url;
                this.audioPlayer.style.display = 'block';
                this.audioPlayer.load();
                this.audioPlayer.play();
            }
            
            this.currentFileEl.textContent = file.name;
            this.updatePlaylistUI();
        }
    }

    nextFile() {
        if (this.playlist.length === 0) return;
        const nextIndex = (this.currentFileIndex + 1) % this.playlist.length;
        this.playFile(nextIndex);
    }

    prevFile() {
        if (this.playlist.length === 0) return;
        const prevIndex = this.currentFileIndex <= 0 
            ? this.playlist.length - 1 
            : this.currentFileIndex - 1;
        this.playFile(prevIndex);
    }

    stopPlayback() {
        this.videoPlayer.pause();
        this.videoPlayer.src = '';
        this.videoPlayer.style.display = 'block';
        
        this.audioPlayer.pause();
        this.audioPlayer.src = '';
        this.audioPlayer.style.display = 'none';
    }

    setupControls() {
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevFile();
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextFile();
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextFile();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevFile();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });
    }

    setupPlayerEvents() {
        // Автовоспроизведение следующего файла
        this.videoPlayer.addEventListener('ended', () => {
            this.nextFile();
        });
        
        this.audioPlayer.addEventListener('ended', () => {
            this.nextFile();
        });
    }

    togglePlayPause() {
        if (this.videoPlayer.style.display !== 'none') {
            if (this.videoPlayer.paused) {
                this.videoPlayer.play();
            } else {
                this.videoPlayer.pause();
            }
        } else if (this.audioPlayer.style.display !== 'none') {
            if (this.audioPlayer.paused) {
                this.audioPlayer.play();
            } else {
                this.audioPlayer.pause();
            }
        }
    }

    updatePlaylistUI() {
        document.querySelectorAll('.file-item').forEach((item, index) => {
            item.classList.toggle('playing', index === this.currentFileIndex);
        });
    }
}